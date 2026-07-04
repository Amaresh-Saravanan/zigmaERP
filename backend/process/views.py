from rest_framework.response import Response

from core.mongo_viewset import MongoModelViewSet
from process.models import (
    CullingProcess,
    DryProcess,
    EggProcess,
    FrpStatusUpdate,
    FrpTrayProcess,
    Leachate,
    MaterialReceived,
    OvenProcess,
    PitStatus,
    StatusUpdate,
)
from process.serializers import (
    CullingProcessSerializer,
    DryProcessSerializer,
    EggProcessSerializer,
    FrpStatusUpdateSerializer,
    FrpTrayProcessSerializer,
    LeachateSerializer,
    MaterialReceivedSerializer,
    OvenProcessSerializer,
    PitStatusSerializer,
    StatusUpdateSerializer,
)


class MaterialReceivedViewSet(MongoModelViewSet):
    document_class = MaterialReceived
    serializer_class = MaterialReceivedSerializer
    required_screens = {
        'list': 'material_received_view',
        'retrieve': 'material_received_view',
        'create': 'material_received_create',
        'update': 'material_received_edit',
        'destroy': 'material_received_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(batch_id__icontains=term)


class CullingProcessViewSet(MongoModelViewSet):
    document_class = CullingProcess
    serializer_class = CullingProcessSerializer
    required_screens = {
        'list': 'culling_process_view',
        'retrieve': 'culling_process_view',
        'create': 'culling_process_create',
        'update': 'culling_process_edit',
        'destroy': 'culling_process_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(cylinder_no__icontains=term)


class OvenProcessViewSet(MongoModelViewSet):
    document_class = OvenProcess
    serializer_class = OvenProcessSerializer
    required_screens = {
        'list': 'oven_process_view',
        'retrieve': 'oven_process_view',
        'create': 'oven_process_create',
        'update': 'oven_process_edit',
        'destroy': 'oven_process_delete',
    }


class DryProcessViewSet(MongoModelViewSet):
    document_class = DryProcess
    serializer_class = DryProcessSerializer
    required_screens = {
        'list': 'dry_process_view',
        'retrieve': 'dry_process_view',
        'create': 'dry_process_create',
        'update': 'dry_process_edit',
        'destroy': 'dry_process_delete',
    }


class LeachateViewSet(MongoModelViewSet):
    document_class = Leachate
    serializer_class = LeachateSerializer
    required_screens = {
        'list': 'leachate_view',
        'retrieve': 'leachate_view',
        'create': 'leachate_create',
        'update': 'leachate_edit',
        'destroy': 'leachate_delete',
    }


class EggProcessViewSet(MongoModelViewSet):
    document_class = EggProcess
    serializer_class = EggProcessSerializer
    required_screens = {
        'list': 'egg_process_view',
        'retrieve': 'egg_process_view',
        'create': 'egg_process_create',
        'update': 'egg_process_edit',
        'destroy': 'egg_process_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(entry_no__icontains=term)

    def destroy(self, request, unique_id=None):
        obj = self.get_object(unique_id)
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=404)
        obj.is_deleted = True
        obj.save()
        batch = obj.batch
        batch.batch_status = 'pending'
        batch.save()
        return Response({'status': 1, 'msg': 'success_delete', 'data': None, 'error': ''})


class StatusUpdateViewSet(MongoModelViewSet):
    document_class = StatusUpdate
    serializer_class = StatusUpdateSerializer
    required_screens = {
        'list': 'status_update_view',
        'retrieve': 'status_update_view',
        'create': 'status_update_create',
        'update': 'status_update_edit',
        'destroy': 'status_update_delete',
    }


class PitStatusViewSet(MongoModelViewSet):
    document_class = PitStatus
    serializer_class = PitStatusSerializer
    required_screens = {
        'list': 'pit_status_view',
        'retrieve': 'pit_status_view',
        'create': 'pit_status_create',
        'update': 'pit_status_edit',
        'destroy': 'pit_status_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(form_batch_id__icontains=term)

    def get_queryset(self):
        qs = super().get_queryset()
        org_status = self.request.query_params.get('org_status')
        if org_status:
            qs = qs.filter(org_status=org_status)
        return qs


class FrpTrayProcessViewSet(MongoModelViewSet):
    document_class = FrpTrayProcess
    serializer_class = FrpTrayProcessSerializer
    required_screens = {
        'list': 'frp_tray_process_view',
        'retrieve': 'frp_tray_process_view',
        'create': 'frp_tray_process_create',
        'update': 'frp_tray_process_edit',
        'destroy': 'frp_tray_process_delete',
    }


class FrpStatusUpdateViewSet(MongoModelViewSet):
    document_class = FrpStatusUpdate
    serializer_class = FrpStatusUpdateSerializer
    required_screens = {
        'list': 'frp_status_update_view',
        'retrieve': 'frp_status_update_view',
        'create': 'frp_status_update_create',
        'update': 'frp_status_update_edit',
        'destroy': 'frp_status_update_delete',
    }
