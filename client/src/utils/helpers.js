import emailjs from 'emailjs-com';

export const swapArrayElements = (arr, index1, index2) => {
    if (index1 >= 0 && index1 < arr.length && index2 >= 0 && index2 < arr.length) {
      const temp = arr[index1];
      arr[index1] = arr[index2];
      arr[index2] = temp;
    }
    return arr;
  };



  export const sendVerificationEmail = (email, token, name, tempPassword) => {
    return new Promise((resolve, reject) => {
      const templateParams = {
        to_email: email,
        to_name: name,
        message: `Your current password is ${tempPassword}. Please change this after verifying your account.`,
        from_email: 'david@builtsturdyblueprint.com',
        verification_link: `https://www.portal.builtsturdyblueprint.com/${token}`
      };
  
      emailjs.send('service_bg8lqmf', 'template_nbn67je', templateParams, '3Mc2Gyl0Fense4EqS')
        .then((response) => {
          console.log('Email sent:', response.status, response.text);
          resolve(response);
        }, (error) => {
          console.log('Email error:', error);
          reject(error);
        });
    });
  };
  
