import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/StoreProvider';
import { useNavigate } from 'react-router-dom';
import { PROFILE_ROUTE } from '@/utils/consts';

const UserAvatar = observer(() => {
  const { user } = useStore();
  const navigate = useNavigate();

  if (!user.isAuth || !user.user) {
    return null;
  }

  const handleAvatarClick = () => {
    navigate(PROFILE_ROUTE);
  };

//   const handleLogout = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     user.logout();
//   };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleAvatarClick}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {getInitials(user.user.email || '')}
        </div>
        <div className="hidden sm:block">
          <p className="text-white text-sm font-medium">{user.user.email}</p>
          <p className="text-gray-300 text-xs">
            {user.user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
          </p>
        </div>
      </div>
      
      {/* <button
        onClick={handleLogout}
        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 backdrop-blur-sm cursor-pointer text-sm"
      >
        Выйти
      </button> */}
    </div>
  );
});

export default UserAvatar;
