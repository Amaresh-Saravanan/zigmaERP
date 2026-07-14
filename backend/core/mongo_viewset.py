from mongoengine.errors import DoesNotExist, ValidationError as MongoValidationError, NotUniqueError
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSetMixin

from accounts.permissions import HasScreenPermission


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
        page = paginator.paginate_queryset(list(queryset), request)
        serializer = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(serializer.data)

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
        return Response({'status': 1, 'msg': 'update', 'data': self.serializer_class(instance).data, 'error': ''})

    def destroy(self, request, unique_id=None):
        obj = self.get_object(unique_id)
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        obj.is_deleted = True
        obj.save()
        return Response({'status': 1, 'msg': 'success_delete', 'data': None, 'error': ''})
