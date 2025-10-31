/* eslint-disable no-console */

'use strict';
const host = `${window.location.protocol}//${window.location.host}`;

console.log('Host:', host);

// Immediately invoke function to check and load React dependencies
(function() {
  // Check if React and ReactDOM are properly loaded
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.warn('React or ReactDOM not loaded properly, attempting to load from fallback CDN');
    
    // Function to load scripts dynamically
    function loadScript(src, callback) {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = callback;
      script.onerror = function() {
        console.error('Failed to load script:', src);
      };
      document.head.appendChild(script);
    }
    
    // Load React and ReactDOM from cdnjs (more reliable and CORS-friendly)
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js', function() {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js', function() {
        // Initialize once the libraries are loaded
        initKhaltiApp();
      });
    });
  } else {
    // React is already loaded, initialize normally
    initKhaltiApp();
  }
})();

// Main initialization function
function initKhaltiApp() {
  // Modern React component using React.createElement for compatibility
  function KhaltiLoad() {
    // Use React hooks for state management
    const [state, setState] = React.useState({
      success: false,
      amount: 100,
      error: ''
    });

    // Get data from global variable
    const { customerId, name, khaltiPublicKey } = window.INITIAL_STATE || {};

    // Predefined amount options
    const amountOptions = [200, 500, 1000, 2000, 2500, 5000, 10000];

    // Handle amount change
    const handleAmountChange = (event) => {
      setState(prevState => ({
        ...prevState,
        amount: Number(event.target.value)
      }));
    };

    // Handle preset amount selection
    const selectPresetAmount = (amount) => {
      setState(prevState => ({
        ...prevState,
        amount
      }));
    };

    // Handle form submission
    function handleSubmit() {
      setState(prevState => ({
        ...prevState,
        error: ''
      }));
    
      if (state.amount < 100) {
        return setState(prevState => ({
          ...prevState,
          error: 'Amount cannot be less than 100.'
        }));
      }
    
      // Make a POST request to initiate the payment
      fetch('/payment-method/khalti/load', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: state.amount * 100,
          purchaseOrderId: `${customerId}-${Date.now()}`,
          purchaseOrderName: 'Wallet Load',
          
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('Payment data:', data.data.paymentUrl);
            // Redirect to Khalti payment URL
            if (data?.data?.paymentUrl) {
              window.location.href = data.data.paymentUrl;
            } else {
              console.error("Payment URL is missing:", data);
            }
            
          
        })
        .catch(error => {
          console.error('Error initiating payment:', error);
          setState(prevState => ({
            ...prevState,
            error: 'Something went wrong. Please try again.'
          }));
        });
    }

    // Configure Khalti checkout
    const config = {
      publicKey: khaltiPublicKey,
      productIdentity: customerId,
      productName: customerId,
      productUrl: 'https://hub.yatrimotorcycles.com',
      paymentPreference: ['KHALTI'],
      eventHandler: {
        onSuccess: (payload) => {
          fetch('/api/v1/wallet/load-wallet/khalti', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })
            .then(response => response.json())
            .then(data => {
              if (data.status === 'fail') {
                alert('Something went wrong, please contact operator');
              } else {
                setState(prevState => ({
                  ...prevState,
                  success: true
                }));
              }
            })
            .catch(error => {
              console.error('Error processing payment:', error);
              alert('Something went wrong, please contact operator');
            });
        },
        onError: (error) => {
          console.error('Khalti payment error:', error);
          alert('Something went wrong, please contact operator');
        }
      }
    };
    
    // Initialize checkout object
    const checkout = new KhaltiCheckout(config);

    // If payment was successful, show success message
    if (state.success) {
      return React.createElement('p', { className: 'text-center' }, 'Success!!! You may close this window.');
    }

    // Main component render using React.createElement
    return React.createElement('div', null, [
      React.createElement('div', { 
        key: 'header',
        className: 'container w-head', 
        style: { textAlign: 'center', padding: '1rem 0' } 
      }, [
        React.createElement('div', { key: 'header-content' }, [
          React.createElement('p', { key: 'load-text', className: 'text-muted' }, [
            'Load',
            React.createElement('strong', { key: 'wallet-text', style: { color: '#000' } }, ' YATRI WALLET '),
            'through'
          ]),
          React.createElement('img', { 
            key: 'khalti-logo',
            src: '/images/khalti.png', 
            width: 100, 
            className: 'khalti-logo',
            alt: 'Khalti logo'
          })
        ]),
        React.createElement('p', { 
          key: 'for-text',
          className: 'text-muted', 
          style: { fontSize: '0.9rem' } 
        }, 'For'),
        React.createElement('p', { key: 'name' }, name)
      ]),
      
      React.createElement('div', { 
        key: 'form',
        className: 'container', 
        style: { padding: '15px 60px' } 
      }, [
        React.createElement('label', { key: 'amount-label' }, 'Enter amount'),
        React.createElement('input', {
          key: 'amount-input',
          type: 'number',
          value: state.amount,
          className: 'form-control',
          onChange: handleAmountChange,
          onKeyPress: (evt) => {
            if (!/[0-9]/.test(evt.key)) {
              evt.preventDefault();
            }
          }
        }),
        
        React.createElement('div', { key: 'btn-group', className: 'btn-group' }, 
          amountOptions.map((amount) => 
            React.createElement('button', { 
              key: `btn-${amount}`,
              className: 'btn btn-cash', 
              onClick: () => selectPresetAmount(amount) 
            }, amount)
          )
        ),
        
        state.error && React.createElement('span', { 
          key: 'error', 
          className: 'text-danger small' 
        }, state.error),
        
        React.createElement('button', {
          key: 'submit-btn',
          className: 'btn btn-khalti',
          style: { marginTop: '1rem' },
          onClick: () => handleSubmit(checkout)
        }, 'Load wallet')
      ])
    ]);
  }

  // Render the component to the DOM
  const domContainer = document.querySelector('#root');
  ReactDOM.render(React.createElement(KhaltiLoad), domContainer);
}