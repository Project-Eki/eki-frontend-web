export const googleAuthService = {
  initializeGoogle(clientId) {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.google?.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: resolve,
        });
        return resolve();
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: resolve,
          auto_select: false,
        });
      };
      document.body.appendChild(script);
    });
  },

  async sendTokenToBackend(credential, role = 'buyer') {
    const response = await fetch('https://api-7w8f.onrender.com/api/v1/accounts/google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: credential,
        requested_role: role,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Google Backend Auth Failed');
    return data;
  },
  
  // ... logout logic looks great!
};