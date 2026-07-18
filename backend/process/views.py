from rest_framework.response import Response

from core.viewset import BaseModelViewSet
from inventory.models import Pit
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


class MaterialReceivedViewSet(BaseModelViewSet):
    queryset = MaterialReceived.objects.all()
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


class CullingProcessViewSet(BaseModelViewSet):
    queryset = CullingProcess.objects.all()
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


class OvenProcessViewSet(BaseModelViewSet):
    queryset = OvenProcess.objects.all()
    serializer_class = OvenProcessSerializer
    required_screens = {
        'list': 'oven_process_view',
        'retrieve': 'oven_process_view',
        'create': 'oven_process_create',
        'update': 'oven_process_edit',
        'destroy': 'oven_process_delete',
    }


class DryProcessViewSet(BaseModelViewSet):
    queryset = DryProcess.objects.all()
    serializer_class = DryProcessSerializer
    required_screens = {
        'list': 'dry_process_view',
        'retrieve': 'dry_process_view',
        'create': 'dry_process_create',
        'update': 'dry_process_edit',
        'destroy': 'dry_process_delete',
    }


class LeachateViewSet(BaseModelViewSet):
    queryset = Leachate.objects.all()
    serializer_class = LeachateSerializer
    required_screens = {
        'list': 'leachate_view',
        'retrieve': 'leachate_view',
        'create': 'leachate_create',
        'update': 'leachate_edit',
        'destroy': 'leachate_delete',
    }


class EggProcessViewSet(BaseModelViewSet):
    queryset = EggProcess.objects.all()
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

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object_or_none()
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=404)
        # Same-day delete restriction (admin exempt via user_type)
        from datetime import date
        if obj.entry_date != date.today():
            user = request.user
            if not (user.user_type and user.user_type.type_name == 'Admin'):
                return Response({'status': 0, 'msg': 'error', 'data': None, 'error': 'Only today\'s records can be deleted.'}, status=403)
        # Block delete if hatching has started
        from process.models import StatusUpdate
        has_hatching = StatusUpdate.objects.filter(
            batch=obj.batch,
            hatching_status__in=['progressing', 'completed'],
            is_deleted=False
        ).first()
        if has_hatching:
            return Response({'status': 0, 'msg': 'error', 'data': None, 'error': 'Cannot delete: hatching is in progress or completed.'}, status=403)
        obj.is_deleted = True
        obj.save()
        batch = obj.batch
        batch.batch_status = 'pending'
        batch.save()
        return Response({'status': 1, 'msg': 'success_delete', 'data': None, 'error': ''})


class StatusUpdateViewSet(BaseModelViewSet):
    queryset = StatusUpdate.objects.all()
    serializer_class = StatusUpdateSerializer
    required_screens = {
        'list': 'status_update_view',
        'retrieve': 'status_update_view',
        'create': 'status_update_create',
        'update': 'status_update_edit',
        'destroy': 'status_update_delete',
    }


class PitStatusViewSet(BaseModelViewSet):
    queryset = PitStatus.objects.all()
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
        pit_uid = self.request.query_params.get('pit')
        if pit_uid:
            pit = Pit.objects.filter(unique_id=pit_uid).only('id').first()
            qs = qs.filter(pit=pit) if pit else qs.none()
        return qs

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object_or_none()
        if obj is None:
            return Response({'status': 0, 'msg': 'not_found', 'data': None, 'error': 'Not found.'}, status=404)

        # Soft delete the PitStatus record
        obj.is_deleted = True
        obj.save()

        # Cascade: free trays that were assigned to this PitStatus entry
        # Check if any FrpTrayProcess references these trays
        if obj.trays.exists():
            from process.models import FrpTrayProcess
            for tray_ref in obj.trays.all():
                frp = FrpTrayProcess.objects.filter(trays=tray_ref, is_deleted=False).first()
                if frp:
                    frp.trays.remove(tray_ref)  # M2M .remove() persists immediately

        return Response({'status': 1, 'msg': 'success_delete', 'data': None, 'error': ''})


class FrpTrayProcessViewSet(BaseModelViewSet):
    queryset = FrpTrayProcess.objects.all()
    serializer_class = FrpTrayProcessSerializer
    required_screens = {
        'list': 'frp_tray_process_view',
        'retrieve': 'frp_tray_process_view',
        'create': 'frp_tray_process_create',
        'update': 'frp_tray_process_edit',
        'destroy': 'frp_tray_process_delete',
    }


class FrpStatusUpdateViewSet(BaseModelViewSet):
    queryset = FrpStatusUpdate.objects.all()
    serializer_class = FrpStatusUpdateSerializer
    required_screens = {
        'list': 'frp_status_update_view',
        'retrieve': 'frp_status_update_view',
        'create': 'frp_status_update_create',
        'update': 'frp_status_update_edit',
        'destroy': 'frp_status_update_delete',
    }
