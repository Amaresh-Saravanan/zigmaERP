from core.mongo_viewset import MongoModelViewSet
from inventory.models import Item, Pit, Supplier, Tray, Unit
from inventory.serializers import ItemSerializer, PitSerializer, SupplierSerializer, TraySerializer, UnitSerializer


class UnitViewSet(MongoModelViewSet):
    document_class = Unit
    serializer_class = UnitSerializer
    required_screens = {
        'list': 'unit_view',
        'retrieve': 'unit_view',
        'create': 'unit_create',
        'update': 'unit_edit',
        'destroy': 'unit_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(unit_name__icontains=term)


class ItemViewSet(MongoModelViewSet):
    document_class = Item
    serializer_class = ItemSerializer
    required_screens = {
        'list': 'item_view',
        'retrieve': 'item_view',
        'create': 'item_create',
        'update': 'item_edit',
        'destroy': 'item_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(item_name__icontains=term)


class TrayViewSet(MongoModelViewSet):
    document_class = Tray
    serializer_class = TraySerializer
    required_screens = {
        'list': 'tray_view',
        'retrieve': 'tray_view',
        'create': 'tray_create',
        'update': 'tray_edit',
        'destroy': 'tray_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(bin_name__icontains=term)


class PitViewSet(MongoModelViewSet):
    document_class = Pit
    serializer_class = PitSerializer
    required_screens = {
        'list': 'pit_view',
        'retrieve': 'pit_view',
        'create': 'pit_create',
        'update': 'pit_edit',
        'destroy': 'pit_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(pit_name__icontains=term)


class SupplierViewSet(MongoModelViewSet):
    document_class = Supplier
    serializer_class = SupplierSerializer
    required_screens = {
        'list': 'supplier_view',
        'retrieve': 'supplier_view',
        'create': 'supplier_create',
        'update': 'supplier_edit',
        'destroy': 'supplier_delete',
    }

    def filter_search(self, queryset, term):
        return queryset.filter(supplier_name__icontains=term)
