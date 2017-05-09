const index = new Vue({
  el: "#index",
  data: {
    greeting: '',
    todosOverview: '',
    message: '',
    addFormStatus: false,
    newTodo: {},
    user: '',
    todos: [],
    notDeletedTodo: [],
    editFormStatus: false,
    editedTodo : {}
  },
  methods: {
    tokenCheck: function() {
      let token = window.localStorage.getItem('token');
      if(!token) {
        window.location.href='./login.html';
      }
    },
    logout: function() {
      localStorage.clear();
      this.tokenCheck();
    },
    greet: function() {
      let fullDate = new Date();
      let hour = fullDate.getHours();
      if(hour < 10) {
        this.greeting = "good morning";
      } else if(hour < 12) {
        this.greeting = "good day";
      } else if(hour < 18) {
        this.greeting = "good afternoon";
      } else if(hour < 24 || hour < 3) {
        this.greeting = "good evening";
      }

      let name = this.user.name.match(/\w+/i);

      this.greeting += ' ' + name;

    },
    fillNotDeletedTodo: function() {
      this.notDeletedTodo = this.todos.filter(function(todo) {
        return todo.isDeleted === false;
      });
    },
    convertDate: function(oriDate) {
      let fullDate = new Date(oriDate);
      let year = String(fullDate.getFullYear());
      let month = String(fullDate.getMonth()+1);
      if(month.length === 1) {
        month = '0' + month;
      }
      let date = String(fullDate.getDate());
      if(date.length === 1) {
        date = '0' + date;
      }
      return `${year}-${month}-${date}`;
    },
    convertTime: function(oriDate) {
      let fullDate = new Date(oriDate);
      let hour = String(fullDate.getHours());
      if(hour.length === 1) {
        hour = '0' + hour;
      }
      let minute = String(fullDate.getMinutes());
      if(minute.length === 1) {
        minute = '0' + minute;
      }
      return `${hour}:${minute}`;
    },
    outstandingCheck: function() {
      let outstanding = this.todos.filter(function(todo) {
        return todo.isCompleted === false;
      });

      let task = 'task';
      if(outstanding.length >= 1) {
        task+='s';
        this.message = '';
      } else {
        this.message = 'There is nothing to do, have fun! ^_^'
      }

      this.todosOverview = `You have ${outstanding.length} ${task} to do`;

    },
    complete: function(index) {
      this.todos[index].isCompleted = true;
      this.todos[index].completedDate = new Date();

      let url = 'http://localhost:3000/todos/';
      url += this.todos[index]._id;

      let body = {
        isCompleted: true,
        completedDate: new Date(),
        dueDate: this.todos[index].dueDate,
        createdDate: this.todos[index].createdDate
      };

      axios.put(url, body)
        .then(function(response) {
          console.log(response);
        })
        .catch(function(err) {
          console.log(err);
        });

      this.fetchUserData();
    },
    deleteTask: function(index) {
      let self = this;
      let task = this.todos[index].title;
      if(confirm(`do you want to delete ${task} from the list?`)) {

        let url = 'http://localhost:3000/todos/';
        url += self.todos[index]._id;

        let todoIds = [];
        self.todos.map(function(todo) {
          todoIds.push(todo._id);
        });

        axios.delete(url).then(function(response) {
          console.log(response);
          let url = 'http://localhost:3000/user/';
          url += self.user.userId;
          axios.put(url, {todos: todoIds})
            .then(function(res) {
              console.log(res);
              self.todos.splice(index,1);
              self.fetchUserData();
              self.message = 'Task has been successfully deleted';
            })
            .catch(function(err) {
              console.log(err);
              self.message = 'Error occurs when updating the user data, task is not deleted from user';
            });
        }).catch(function(err) {
          console.log(err);
          self.message = 'Error occurs when deleting task, task is not deleted';
        });

      }
      this.outstandingCheck();
    },
    openAddForm: function() {
      this.addFormStatus = true;
    },
    closeAddForm : function() {
      this.addFormStatus = false;
    },
    addTask: function() {
      let self = this;
      let body = {
        userId: this.user.userId,
        title: this.newTodo.title,
        content: this.newTodo.content
      };

      console.log('typeof dueTime', typeof this.newTodo.dueTime);
      console.log('typeof dueDate', typeof this.newTodo.dueDate);

      if((this.newTodo.dueTime.length === 0 && this.newTodo.dueDate.length > 0) || (this.newTodo.dueTime.length > 0 && this.newTodo.dueDate.length === 0)) {
        console.log("caught on first if");
        self.message = 'Due Date and Due Time must not be empty in order to receive notification';
      } else {

        if(this.newTodo.dueDate.length > 0 && this.newTodo.dueTime.length > 0) {
          body.dueDate = new Date(`${this.newTodo.dueDate} ${this.newTodo.dueTime}:00`);
        }

        if(body.title) {
          let url = 'http://localhost:3000/todos';
          axios.post(url, body).then(function(response) {
            let todoIds = [];
            self.todos.map(function(todo) {
              todoIds.push(todo._id);
            });
            todoIds.push(response.data._id);
            let url = 'http://localhost:3000/user/';
            url += self.user.userId;
            axios.put(url, {todos: todoIds})
              .then(function(res) {
                console.log(res);
                self.fetchUserData();
                self.message = 'Task has been successfully added';
                self.closeAddForm();
              })
              .catch(function(err) {
                console.log(err);
                self.message = 'Error occurs when updating the user data, task is not added';
              });
          }).catch(function(err) {
            console.log(err);
          });
        } else {
          self.message = 'Title may not be empty';
        }
      }
    },
    fetchUserData: function() {
      let self = this;
      let login_method = localStorage.getItem('login_method');

      let url = 'http://localhost:3000/dashboard';
      url += '/'+login_method;
      if (login_method === 'facebook') {
        url += '/'+localStorage.getItem('id');
      } else {
        url += '/'+localStorage.getItem('username');
      }

      axios.get(url)
        .then((response) => {
          // console.log(response);
          self.todos = response.data.todos;
          if(login_method === "local") {
            let user = {
              userId: response.data._id,
              name: response.data.local.username,
              email: response.data.local.email
            };
            self.user = user;
          } else if( login_method === "facebook") {
            let user = {
              userId: response.data._id,
              name: response.data.facebook.name,
              email: response.data.facebook.email
            };
            self.user = user;
          }

          self.outstandingCheck();
          self.fillNotDeletedTodo();
          this.createShowToggle();
          self.greet();
          console.log(self.todos);

        })
        .catch((err) => {
          console.log(err);
        });
    },
    openEditForm: function(index) {
      this.editedTodo.index = index;
      this.editedTodo.isCompleted = this.todos[index].isCompleted;
      this.editedTodo.title = this.todos[index].title;
      this.editedTodo.content = this.todos[index].content;
      if(this.todos[index].dueDate !== null) {
        this.editedTodo.dueDate = this.convertDate(new Date(this.todos[index].dueDate));
      }
      this.editFormStatus = true;
    },
    closeEditForm: function() {
      this.editFormStatus = false;
    },
    editTask: function(index) {

      let self = this;
      let url = 'http://localhost:3000/todos/';
      url += this.todos[index]._id;

      let body = {
        isCompleted: this.editedTodo.isCompleted,
        title: this.editedTodo.title,
        content: this.editedTodo.content,
        completedDate: this.todos[index].completedDate,
        createdDate: this.todos[index].createdDate
      };

      if(this.editedTodo.dueDate !== null) {
        body.dueDate = new Date(this.editedTodo.dueDate);
      }

      axios.put(url, body)
        .then(function(response) {
          console.log(response);
          self.closeEditForm();
          self.fetchUserData();
        })
        .catch(function(err) {
          console.log(err);
        });

    },
    createShowToggle: function() {
      this.todos.map(function(todo) {
        if(!todo.hasOwnProperty('showMore')) {
          todo.showMore = false;
        }
      });
    },
    showMore: function(index) {
      this.todos[index].showMore = true;
    },
    showLess: function(index) {
      this.todos[index].showMore = false;
    },
    titleSortAsc: function() {
      this.todos.sort(function(a, b) {
        return (a.title.toLowerCase()).localeCompare(b.title.toLowerCase());
      });
    },
    titleSortDesc: function() {
      this.todos.sort(function(a, b) {
        return (b.title.toLowerCase()).localeCompare(a.title.toLowerCase());
      });
    },
    createdAtSortAsc: function() {
      this.todos.sort(function(a, b) {
        return (a.createdDate > b.createdDate);
      });
    },
    createdAtSortDesc: function() {
      this.todos.sort(function(a, b) {
        return (a.createdDate < b.createdDate);
      });
    },
    dueDateSortAsc: function() {
      this.todos.sort(function(a, b) {
        if (a.dueDate === null) {
          return 1;
        } else if (b.dueDate === null) {
          return -1;
        } else if (a.dueDate === b.dueDate) {
          return 0;
        } else {
          return (a.dueDate > b.dueDate);
        }
      });
    },
    dueDateSortDesc: function() {
      this.todos.sort(function(a, b) {
        if (a.dueDate === null) {
          return 1;
        } else if (b.dueDate === null) {
          return -1;
        } else if (a.dueDate === b.dueDate) {
          return 0;
        } else {
          return (a.dueDate < b.dueDate);
        }
      });
    },
    completedAtSortAsc: function() {
      this.todos.sort(function(a, b) {
        if (a.completedDate === null) {
          return 1;
        } else if (b.completedDate === null) {
          return -1;
        } else if (a.completedDate === b.completedDate) {
          return 0;
        } else {
          return a.completedDate > b.completedDate;
        }
      });
    },
    completedAtSortDesc: function() {
      this.todos.sort(function(a, b) {
        if (a.completedDate === null) {
          return 1;
        } else if (b.completedDate === null) {
          return -1;
        } else if (a.completedDate === b.completedDate) {
          return 0;
        } else {
          return a.completedDate < b.completedDate;
        }
      });
    }
  },
  created: function() {

    this.tokenCheck();

    this.fetchUserData();



  }
});
