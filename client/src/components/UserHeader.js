import React from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth';
import '../utils/css/UserHeader.css'; // Import your CSS

const UserHeader = () => {
  
  const profile = Auth.getProfile().data;

  const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: profile ? profile._id : '' },
    skip: !profile // Skip the query if profile is null
  });

  if (!profile || (!data && !loading)) {
    window.location.href = '/login';
    return null;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (data && data.user) {
    const { firstname, lastname, profileImage } = data.user;
    const initials = `${firstname[0]}${lastname[0]}`;

    return (
      <header>
        {/* User-specific header content */}
        
        <div className="profile-container">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-initials">{initials}</div>
          )}
        </div>
        <div className='details'>
        <h2>{firstname} {lastname}</h2>
        <p>{data.user.mainPhysiqueGoal}</p>
        </div>
        {/* ... */}
      </header>
    );
  }

  return null;
};

export default UserHeader;
