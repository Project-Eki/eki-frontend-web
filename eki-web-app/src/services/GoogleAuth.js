export const googleAuthService = {
  initializeGoogle(clientId) {
    return new Promise((resolve) => {
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
    try {
      const response = await fetch('https://api-7w8f.onrender.com/api/v1/accounts/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: credential,
          requested_role: role,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.toLowerCase().includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(
          text || 'Google Backend Auth Failed: Invalid response from server'
        );
      }

      if (!response.ok) throw new Error(data.message || 'Google Backend Auth Failed');

      return data;

    } catch (err) {
      throw new Error(err.message || 'Google sign-in failed. Please try again.');
    }
  },
};