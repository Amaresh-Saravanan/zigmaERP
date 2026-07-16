from django.utils import timezone
from mongoengine import Document, ListField, ReferenceField
from mongoengine.errors import DoesNotExist, ValidationError as MongoValidationError, NotUniqueError
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSetMixin

from accounts.permissions import HasScreenPermission


# ponytail: audit/event-log models are exempt from the child-guard even though they
# have is_deleted — they're historical logs expected to outlive the parent they
# reference (AuthToken access is already cut via User.is_deleted in authentication.py;
# LoginHistory is a record of past events, not a live business relation). Extend this
# set only for models with that same "log of what happened" shape, not real children.
_AUDIT_LOG_MODELS = {'AuthToken', 'LoginHistory'}


def _referencing_child(obj):
    """
    Find a live, soft-deletable document that still references obj via a ReferenceField.
    ponytail: walks Document.__subclasses__() instead of a hand-maintained model
    registry, so every app's models are covered by one guard with no per-model wiring.
    """
    for doc_cls in Document.__subclasses__():
        if doc_cls.__name__ in _AUDIT_LOG_MODELS:
            continue
        fields = getattr(doc_cls, '_fields', None)
        if not fields or 'is_deleted' not in fields:
            continue
        for field_name, field in fields.items():
            ref_field = field.field if isinstance(field, ListField) else field
            if not (isinstance(ref_field, ReferenceField) and ref_field.document_type == type(obj)):
                continue
            if doc_cls.objects(is_deleted=False, **{field_name: obj}).first():
                return doc_cls
    return None


class DataTablePagination(PageNumberPagination):
    """Lets the frontend's 'Show N entries' selector pick page size, capped at 100."""

    page_size_query_param = 'page_size'
    max_page_size = 100


class MongoModelViewSet(ViewSetMixin, APIView):
    """
    Hand-rolled CRUD viewset for MongoEngine Documents.

    DRF's ModelViewSet/GenericAPIView assume a Django ORM queryset — its
    get_object_or_404 reads `queryset.model.DoesNotExist`, which mongoengine
    querysets don't expose (they use `_document`, not `.model`), so the
    generic mixins 500 instead of 404ing. This implements the same five
    actions directly against mongoengine instead of fighting that mismatch.

    Subclasses set: document_class, serializer_class, required_screens
    (action -> screen id, e.g. {'list': 'item_view', 'create': 'item_create'}).
    """

    permission_classes = [HasScreenPermission]
    document_class = None
    serializer_class = None
    lookup_field = 'unique_id'
    pagination_class = DataTablePagination
    required_screens = {}

    def get_queryset(self):
        return self.document_class.objects(is_deleted=False)

    def get_object(self, unique_id):
        try:
            return self.get_queryset().get(unique_id=unique_id)
        except (DoesNotExist, MongoValidationError):
            return None

    def filter_search(self, queryset, term):
        """Override per-model to support ?search=."""
        return queryset

    def list(self, request):
        queryset = self.get_queryset().order_by('-created_at')
        search = request.query_params.get('search')
        if search:
            queryset = self.filter_search(queryset, search)

        paginator = self.pagination_class()
        queryset = list(queryset)
        page = paginator.paginate_queryset(queryset, request)
        serializer = self.serializer_class(page, many=True)
        return Response({
            'status': 1, 'msg': 'success',
            'data': {'count': len(queryset), 'results': serializer.data},
            'error': '',
        })

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 0, 'msg': 'validation_error', 'data': serializer.errors, 'error': 'Validation failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            instance = serializer.save()
        except NotUniqueError:
            return Response(
                {'status': 0, 'msg': 'error', 'data': None, 'error': 'A record with this value already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'status': 1, 'msg': 'create', 'data': self.serializer_class(instance).data, 'error': ''},
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, unique_id=None):
        obj = self.get_object(unique_id)
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 1, 'msg': '', 'data': self.serializer_class(obj).data, 'error': ''})

    def update(self, request, unique_id=None):
        obj = self.get_object(unique_id)
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.serializer_class(instance=obj, data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 0, 'msg': 'validation_error', 'data': serializer.errors, 'error': 'Validation failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance = serializer.save()
        instance.updated_at = timezone.now()
        instance.save()
        return Response({'status': 1, 'msg': 'update', 'data': self.serializer_class(instance).data, 'error': ''})

    def destroy(self, request, unique_id=None):
        obj = self.get_object(unique_id)
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        blocker = _referencing_child(obj)
        if blocker is not None:
            return Response({
                'status': 0, 'msg': 'has_dependents', 'data': None,
                'error': f'Cannot delete: still referenced by {blocker.__name__}.',
            }, status=status.HTTP_400_BAD_REQUEST)
        obj.is_deleted = True
        obj.save()
        return Response({'status': 1, 'msg': 'success_delete', 'data': None, 'error': ''})
