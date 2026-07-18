from django.apps import apps
from django.db import IntegrityError
from django.db.models import ForeignKey, ManyToManyField
from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import HasScreenPermission


# ponytail: audit/event-log models are exempt from the child-guard even though they
# have is_deleted — they're historical logs expected to outlive the parent they
# reference (AuthToken access is already cut via User.is_deleted in authentication.py;
# LoginHistory is a record of past events, not a live business relation). Extend this
# set only for models with that same "log of what happened" shape, not real children.
_AUDIT_LOG_MODELS = {'AuthToken', 'LoginHistory'}


def _referencing_child(obj):
    """
    Find a live, soft-deletable row that still references obj via a ForeignKey
    or ManyToManyField.
    ponytail: walks apps.get_models() instead of a hand-maintained model
    registry, so every app's models are covered by one guard with no per-model wiring.
    """
    for model in apps.get_models():
        if model.__name__ in _AUDIT_LOG_MODELS:
            continue
        model_fields = {f.name: f for f in model._meta.get_fields()}
        if 'is_deleted' not in model_fields:
            continue
        for field_name, field in model_fields.items():
            if not (isinstance(field, (ForeignKey, ManyToManyField)) and field.related_model is type(obj)):
                continue
            if model.objects.filter(is_deleted=False, **{field_name: obj}).exists():
                return model
    return None


class DataTablePagination(PageNumberPagination):
    """Lets the frontend's 'Show N entries' selector pick page size, capped at 100."""

    page_size_query_param = 'page_size'
    max_page_size = 100


class BaseModelViewSet(ModelViewSet):
    """
    CRUD viewset for Django ORM models — response envelope, soft-delete, and
    screen-permission aware.

    Subclasses set: queryset = Model.objects.all(), serializer_class,
    required_screens (action -> screen id, e.g. {'list': 'item_view', 'create': 'item_create'}).
    """

    permission_classes = [HasScreenPermission]
    lookup_field = 'unique_id'
    pagination_class = DataTablePagination
    required_screens = {}

    def get_queryset(self):
        return self.queryset.filter(is_deleted=False).order_by('-created_at')

    def get_object_or_none(self):
        try:
            return self.get_object()
        except Http404:
            return None

    def filter_search(self, queryset, term):
        """Override per-model to support ?search=."""
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        search = request.query_params.get('search')
        if search:
            queryset = self.filter_search(queryset, search)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = self.get_serializer(page, many=True)
        return Response({
            'status': 1, 'msg': 'success',
            'data': {'count': queryset.count(), 'results': serializer.data},
            'error': '',
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 0, 'msg': 'validation_error', 'data': serializer.errors, 'error': 'Validation failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            instance = serializer.save()
        except IntegrityError:
            return Response(
                {'status': 0, 'msg': 'error', 'data': None, 'error': 'A record with this value already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'status': 1, 'msg': 'create', 'data': self.get_serializer(instance).data, 'error': ''},
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object_or_none()
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 1, 'msg': '', 'data': self.get_serializer(obj).data, 'error': ''})

    def update(self, request, *args, **kwargs):
        obj = self.get_object_or_none()
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance=obj, data=request.data)
        if not serializer.is_valid():
            return Response(
                {'status': 0, 'msg': 'validation_error', 'data': serializer.errors, 'error': 'Validation failed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance = serializer.save()
        instance.updated_at = timezone.now()
        instance.save()
        return Response({'status': 1, 'msg': 'update', 'data': self.get_serializer(instance).data, 'error': ''})

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object_or_none()
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
