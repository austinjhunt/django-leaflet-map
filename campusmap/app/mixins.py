from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User 
class StaffRoleRequiredMixin: 
    def dispatch(self, request, *args, **kwargs):
        if User.objects.filter(is_staff=True, id=request.user.id).count() > 0:
            return super().dispatch(request, *args, **kwargs)
        else:
            raise PermissionDenied