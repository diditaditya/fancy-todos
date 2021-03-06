new Vue({
  el:"#login",
  data: {
    regFormStatus: false,
    newUsername: '',
    newEmail: '',
    newPassword: '',
    message: '',
    username: '',
    password: '',
    name: ''
  },
  methods: {
    tokenCheck: function() {
      let token = localStorage.getItem('token');
      if(token) {
        this.name = localStorage.getItem('name') || localStorage.getItem('username');
      } else {
        this.name = '';
      }
    },
    openRegForm: function() {
      this.regFormStatus = true;
    },
    closeRegForm: function() {
      this.regFormStatus = false;
    },
    register: function() {

      let self = this;

      let body = {
        username: this.newUsername,
        email: this.newEmail,
        password: this.newPassword
      }

      let url = 'http://localhost:3000/localSignup';

      axios.post(url, body)
        .then(function(response) {
          console.log(response);
          self.regFormStatus = false;
          self.message = 'Your are successfully registered, please sign in with your account';
        })
        .catch(function(err) {
          console.log(err);
        });

    },
    goHome: function() {
      window.location.href="index.html";
    },
    logout: function() {
      localStorage.clear();
      this.tokenCheck();
    },
    login: function() {
      let self = this;
      let body = {
        username: self.username,
        password: self.password
      }

      if(localStorage.getItem('token')) {
        self.message = 'please sign out first';
      } else {
        if(body.username.length > 0 && body.password.length > 0) {
          let url = 'http://localhost:3000/localSignin';
          axios.post(url, body)
            .then((response) => {
              console.log(response);
              if(response.data.status === "success") {
                localStorage.setItem('login_method', 'local');
                localStorage.setItem('username', body.username);
                localStorage.setItem('token', response.data.token);
                window.location.href='../index.html';
              } else {
                self.message = response.data.message;
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          self.message = 'username and password are required';
        }
      }

    },
    facebookLogin: function() {
      let url = 'http://localhost:3000/auth/facebook';
      axios.get(url)
        .then((response) => {
          console.log(response);
          // localStorage.setItem('token', response.data.token);
          // var retrievedObject = localStorage.getItem('token');
          // console.log(retrievedObject);
          // window.location.href='../index.html';
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
  created: function() {
    this.tokenCheck()
  }
});
