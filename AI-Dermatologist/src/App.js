import { Routes, Route } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { supabase } from './supabase';
import { DataProvider } from './contexts/DataContext';

// Helper to lazy load named exports - must be defined before use
const createLazyNamedExport = (importFn, exportName) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[exportName] };
  });
};

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#667eea'
  }}>
    Loading...
  </div>
);

// Lazy load components for code splitting - improves initial load time
const Home = lazy(() => import('./Components/Homepage/Home'));
const Login = lazy(() => import('./Components/Loginsignup/Login'));
// Password components
const Password = lazy(() => import('./Components/Loginsignup/Password'));
const ResetPassword = lazy(() => import('./Components/Loginsignup/ResetPassword'));
const Firstscreen = lazy(() => import('./Components/Loginsignup/Firstscreen'));
const Signup = lazy(() => import('./Components/Loginsignup/Signup'));
const Upload = lazy(() => import('./Components/Uploadphoto/Upload'));
const Listing = lazy(() => import('./Components/Dermatologistlisting/Listing'));
const Profile = lazy(() => import('./Components/Dermatologistprofile/Profile'));
const Bookappointment = lazy(() => import('./Components/BookAppointment/Bookappointment'));
const Chat = lazy(() => import('./Components/Chat/Chat'));
const ProfileDraft = lazy(() => import('./Components/DoctorProfilecreate/ProfileDraft'));
const Admin = lazy(() => import('./Components/Admin/Admin'));
const NewRequest = lazy(() => import('./Components/Admin/NewRequest'));
const ApprovedRequest = lazy(() => import('./Components/Admin/ApprovedRequest'));
const Details = lazy(() => import('./Components/Admin/Details'));
const ProfileSetting = lazy(() => import('./Components/DoctorProfilecreate/ProfileSetting.jsx'));
const Doctoravailability = lazy(() => import('./Components/BookAppointment/Doctoravailability.jsx'));
const Confirmation = lazy(() => import('./Components/BookAppointment/Confirmation.jsx'));
const ChatBot = lazy(() => import('./Components/Uploadphoto/chat-bot.js'));
const Notifications = lazy(() => import('./Components/Notifications/Notifications'));
const UserBooking = lazy(() => import('./Components/BookAppointment/UserBookings.jsx'));
const Reviews = lazy(() => import('./Components/Dermatologistprofile/Reviews.jsx'));


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getProfile = async (userId) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUser(data);
      }
    };

    // Check if login has expired (2 weeks = 14 days)
    const checkLoginExpiration = async () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      
      if (loginTimestamp) {
        const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
        const currentTime = Date.now();
        const timeSinceLogin = currentTime - parseInt(loginTimestamp, 10);
        
        if (timeSinceLogin > twoWeeksInMs) {
          // Login has expired, log out the user
          await supabase.auth.signOut();
          localStorage.removeItem('loginTimestamp');
          setUser(null);
          return true; // Return true if expired
        }
      }
      return false; // Return false if not expired
    };

    // Check expiration first
    checkLoginExpiration().then((isExpired) => {
      if (!isExpired) {
        // Then check for existing session
        supabase.auth.getSession().then(({ data }) => {
          const sessionUser = data.session?.user;
          if (sessionUser) {
            // If no timestamp exists, create one (for users already logged in)
            if (!localStorage.getItem('loginTimestamp')) {
              localStorage.setItem('loginTimestamp', Date.now().toString());
            }
            getProfile(sessionUser.id);
          }
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        // Check if login has expired before setting user
        const isExpired = await checkLoginExpiration();
        if (!isExpired) {
          // Update login timestamp when session is active (only if it doesn't exist)
          if (!localStorage.getItem('loginTimestamp')) {
            localStorage.setItem('loginTimestamp', Date.now().toString());
          }
          getProfile(sessionUser.id);
        }
      } else {
        setUser(null);
        localStorage.removeItem('loginTimestamp');
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [])


  return (
    <DataProvider user={user}>
      <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path='/' element={<Home user={user} />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/Signup' element={<Signup />} />
        <Route path='/ProfileDraft' element={<ProfileDraft user={user} />} />
        <Route path='/Password' element={<Password />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        <Route path='/Firstscreen' element={<Firstscreen />} />
        <Route path='/Upload' element={<Upload user={user} />} />
        <Route path='/Listing' element={<Listing user={user} />} />
        <Route path='/Profile/:doctorId' element={<Profile user={user} />} />
        <Route path='/Admin' element={<Admin />} />
        <Route path='/Details' element={<Details />} />
        <Route path='/BookAppointment/:doctorId' element={<Bookappointment user={user} />} />
        <Route path='/NewRequest' element={<NewRequest />} />
        <Route path='/ApprovedRequest' element={<ApprovedRequest />} />
        <Route path='/Chat' element={<Chat user={user} />} />
        <Route path='/Chat/:chatId' element={<Chat user={user} />} />
        <Route path='/ProfileSetting' element={<ProfileSetting user={user} />} />
        <Route path='/Doctoravailability' element={<Doctoravailability user={user} />} />
        <Route path='/Confirmation' element={<Confirmation user={user} />} />
        <Route path='/chatBot' element={<ChatBot />} />
        <Route path='/Notifications' element={<Notifications user={user} />} />
        <Route path='/UserBookings/:userId' element={<UserBooking user={user} />}/>
        <Route path='/Reviews/:userId' element={<Reviews user={user} />}/>
      </Routes>
      </Suspense>
    </DataProvider>
  );
}

export default App;



