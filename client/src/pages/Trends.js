// Trends.js
import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { QUERY_USER_by_id } from '../utils/queries';


import Auth from '../utils/auth';

const Trends = () => {
const { loading, error, data } = useQuery(QUERY_USER_by_id, {
    variables: { userId: Auth.getProfile().data._id },
  });
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

}

export default Trends;