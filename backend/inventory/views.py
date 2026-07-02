from core.mongo_viewset import MongoModelViewSet
from inventory.models import Item, Unit
from inventory.serializers import ItemSerializer, UnitSerializer


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
