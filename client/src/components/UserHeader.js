import React from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';
import Auth from '../utils/auth'


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
    return (
      <header>
        {/* User-specific header content */}
        <h1>{data.user.firstname} {data.user.lastname}</h1>
        {/* ... */}
      </header>
    );
  }

  return null;
};
 export default UserHeader;