angular.module('App.controllers', [])
    .controller('IndexController', ['$scope','$http','$route', function ($scope,$http,$route) {

      //newaccount number accross funs
      var newvpa = null;
      var storage = window.localStorage;
      //initialize the account type
      $scope.actype = "ini";
      //for pulse da
      $scope.pulse = false;
      $scope.curbal = 5000;
      //for toasting
      //initializing the looks to false
      $scope.dash = false;
      $scope.receivebtn = false;
      $scope.tab1 = false;
      $scope.tab1 = false;
      $scope.register = false;
      $scope.extradetails = false;
      $scope.paydiv = false;
      $scope.payconfirm = false;
      //reload button floater right bottom - rbl
      $scope.rbl = false;
      //receive amount div for merchants
      $scope.ramt = false;
      $scope.loader = true;
      //loading the avatars
      $scope.avatars1 = ['boy1','boy2','girl1','girl2'];
      $scope.avatars2 = ['man1','man2','man3'];
      //initializing the chosen avatara
      $scope.chosenavatar = null;
      //function for handling selection of avatar and pulse
      $scope.newavatar = function(avatarda) {
        console.log(avatarda);
        //remove pulse class from all the avatars
        angular.forEach($scope.avatars1, function(value, index) {
          var temp = angular.element( document.querySelector('#'+value));
          temp.removeClass('pulse');
        });
        angular.forEach($scope.avatars2, function(value, index) {
          var temp = angular.element( document.querySelector('#'+value));
          temp.removeClass('pulse');
        });
        //add pulse to the selected one
        var svt = angular.element( document.querySelector('#'+avatarda));
        svt.addClass('pulse');
        $scope.chosenavatar = avatarda;
      };
      $scope.newextra = function() {
        //check if all the fields are done
        //check for avatar selection
        if($scope.chosenavatar == null) {
          Materialize.toast('Please select an avatar', 2000);
        }
        else if(angular.element(document.querySelector('#nickname')).val() == '') {
          Materialize.toast('Please enter a nickname', 2000);
        }
        else if($scope.actype == "ini"){
          Materialize.toast('Please select an account type', 2000);
        }
        else {
          $scope.extradetails = false;
          $scope.loader = true;
          //all clear go go !
          //store the avatar, nickname and account type
          storage.setItem("avatar", $scope.chosenavatar);
          storage.setItem("nickname", angular.element(document.querySelector('#nickname')).val());
          storage.setItem("type", $scope.actype);
          //make a call to backend to store the data in mysql db
          $http({
            url: 'http://172.16.109.252:5000/extradata',
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({
              'avatar': $scope.chosenavatar,
              'nickname': angular.element(document.querySelector('#nickname')).val(),
              'type': $scope.actype,
              'vpa': newvpa,
              'lat': '13.082680',
              'lng': '80.270718'
            })
          }).success(function (data) {
            if(data.stat=='success')
            {
              //take it from here.
              console.log('hurray');
              //load the balance to curbal
              $scope.loader = false;
              $scope.dash = true;
              $scope.tab1 = true;
              $scope.rbl = true;
              if (data.actype!='individual')
              {
                //this means it is a merchant
                $scope.receivebtn = true;
              }
              Materialize.toast('Success', 2000);
            }
            else
            {
              Materialize.toast('Failed while inserting', 2000);
            }
          }).error(function (data) {
            Materialize.toast('Something went wrong!', 2000);
          })

          //dashboard will come
        }
      }
      //$scope.loader = true;
      //will check in the device's local memory, if new user or not
      var value = storage.getItem("pubkey");
      //value = 3423234;
      console.log(value);
      if(value == null)
      {
        $scope.loader = false;
        //prompt to get the acc details
        $scope.register = true;
      }
      else
      {
        $http({
          url: 'http://172.16.109.252:5000/curbal',
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({'vpa': storage.getItem("pubkey")})
        }).success(function (data) {
          if(data == 'invalid')
          {
            console.log(data);
            $scope.loader = false;
            $scope.dash = true;
            $scope.tab1 = true;
            $scope.rbl = true;
            Materialize.toast('balance enquiry failed!', 2000);
          }
          else
          {
            $scope.curbal = data.curbal;
            if (data.actype!='individual')
            {
              //this means it is a merchant
              $scope.receivebtn = true;
            }
            $scope.loader = false;
            $scope.dash = true;
            $scope.tab1 = true;
            $scope.rbl = true;
          }
        }).error(function (data) {
          $scope.loader = false;
          $scope.dash = true;
          $scope.tab1 = true;
          $scope.rbl = true;
          Materialize.toast('Failed!', 2000);

        });
        //now retrieve the acc details from the device's local memory
        //hit a request to retailbanking api to get the balance
      }
      //function when new user touches submit btn
      $scope.newuser = function() {
        var accountno = $('#accountno').val();
        if(accountno)
        {
          console.log(accountno);
          //loader appears and form disappears
          $scope.register = false;
          $scope.loader = true;
          //send it to the backend
          $http({
            url: 'http://172.16.109.252:5000/newuser',
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({'accountno': accountno})
          }).success(function (data) {
            if(data == 'invalid')
            {
              $scope.loader = false;
              $scope.register = true;
              Materialize.toast('Invalid account number', 2000);
            }
            else
            {
              //will hit a request to get the balance details
              console.log(data);
              newvpa = data.pubkey;
              storage.setItem("pubkey", data.pubkey);
              storage.setItem("privatekey", data.privatekey);
              $scope.curbal = data.currentbalance;
              $scope.loader = false;
              //chose avatar and nickname and type
              $scope.extradetails = true;
              Materialize.toast('Account number accepted!', 2000);
            }
          }).error(function (data) {
            $scope.loader = false;
            $scope.register = true;
            Materialize.toast('Sorry, it failed', 2000);
          });
        }
        else
        {
          Materialize.toast('Please fill in the account number', 2000);
        }
      }
      // $('ul.tabs').tabs({
      //   swipeable: true
      // });
      //initializign the nearby guys
      $scope.nearby = null;
      $scope.pay = function () {
        $scope.dash = false;
        $scope.tab1 = true;
        $scope.loader = true;
        //fetch nearby receivers from server
        $http({
          url: 'http://172.16.109.252:5000/nearby',
          method: "POST",
          headers: { 'Content-Type': 'application/json'},
          data: JSON.stringify({'lat': 13.082680, 'long': 80.270718, 'vpa': storage.getItem("pubkey")})
        }).success(function (data) {
          if(data == 'empty')
          {
            //display no one is around!
            $scope.nearby = [];
            $scope.loader = false;
            $scope.paydiv = true;
          }
          else
          {
            //load the cards in nearby
            $scope.nearby = data['guys'];
            console.log(data['guys']);
            $scope.loader = false;
            $scope.paydiv = true;
          }
        }).error(function (data) {
          $scope.loader = false;
          $scope.paydiv = true;
          Materialize.toast('Nearby loader failed!', 2000);
        })
      }
      $scope.payvpa = function () {
        //get the amount details and vpa hit the backend
        //check if field is empty or not.
        if(angular.element(document.querySelector('#payamount')).val() == '') {
          Materialize.toast('Please enter an amount', 2000);
        }
        else if(angular.element(document.querySelector('#vpanumber')).val() == ''){
          Materialize.toast('Please enter a VPA', 2000);
        }
        else {
          var payeeamount = angular.element(document.querySelector('#payamount')).val();
          var payeevpa = angular.element(document.querySelector('#vpanumber')).val();
          //hit the back end to check for valid vpa and bring in the details of that vpa.
          $scope.paydiv = false;
          $scope.loader = true;
          $http({
            url: 'http://172.16.109.252:5000/payeeconfirm',
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            data: JSON.stringify({'payvpa': payeevpa})
          }).success(function (data) {
            if(data == 'invalid')
            {
              $scope.loader = false;
              $scope.paydiv = true;
              Materialize.toast('Invalid VPA number', 2000);
            }
            else
            {
              $scope.payeeamount = payeeamount;
              $scope.payeevpa = payeevpa;
              $scope.fsd = data;
              $scope.loader = false;
              $scope.payconfirm = true;
            }
          }).error(function (data) {
            $scope.loader = false;
            $scope.paydiv = true;
            Materialize.toast('Something went wrong!', 2000);
          })
        }
      }
      //for the direct pay from nearby merchants
      $scope.directpay = function (dvpa,damount) {
        console.log(dvpa);
        console.log(damount);
        var payeeamount = damount;
        var payeevpa = dvpa;
        //hit the back end to check for valid vpa and bring in the details of that vpa.
        $scope.paydiv = false;
        $scope.loader = true;
        $http({
          url: 'http://172.16.109.252:5000/payeeconfirm',
          method: "POST",
          headers: { 'Content-Type': 'application/json'},
          data: JSON.stringify({'payvpa': payeevpa})
        }).success(function (data) {
          if(data == 'invalid')
          {
            $scope.loader = false;
            $scope.paydiv = true;
            Materialize.toast('Invalid VPA number', 2000);
          }
          else
          {
            $scope.payeeamount = payeeamount;
            $scope.payeevpa = payeevpa;
            $scope.fsd = data;
            $scope.loader = false;
            $scope.payconfirm = true;
          }
        }).error(function (data) {
          $scope.loader = false;
          $scope.paydiv = true;
          Materialize.toast('Something went wrong!', 2000);
        })
      }
      $scope.transfer = function() {
        $scope.payconfirm = false;
        $scope.loader = true;
        //hit the backend for transfer
        $http({
          url: 'http://172.16.109.252:5000/transfer',
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({'vpa': $scope.payeevpa, 'amount': $scope.payeeamount, 'fvpa': storage.getItem("pubkey")})
        }).success(function (data) {
          if(data == 'failed')
          {
            $scope.loader = false;
            $scope.payconfirm = true;
            Materialize.toast('Sorry, it failed', 2000);
          }
          else
          {
            //hit the backend for the current balance
            $http({
              url: 'http://172.16.109.252:5000/curbal',
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              data: JSON.stringify({'vpa': storage.getItem("pubkey")})
            }).success(function (data) {
              if(data == 'invalid')
              {
                console.log(data);
                $scope.loader = false;
                $scope.dash = true;
                $scope.tab1 = true;
                Materialize.toast('balance enquiry failed!', 2000);
              }
              else
              {
                $scope.curbal = data.curbal;
                $scope.loader = false;
                $scope.dash = true;
                $scope.tab1 = true;
                Materialize.toast('Success', 2000);
              }
            }).error(function (data) {
              $scope.loader = false;
              $scope.dash = true;
              $scope.tab1 = true;
              Materialize.toast('Failed!', 2000);

            });

          }
        })

      }
      $scope.reload = function (){
        $route.reload();
      }
      $scope.receive = function() {
        console.log("wow da I am going to receive money!!");
        //hit the backend for list of items for merchant
        $scope.dash = false;
        $scope.loader = true;
        $http({
          url: 'http://172.16.109.252:5000/meritems',
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify({
            'vpa': storage.getItem("pubkey")
          })
        }).success(function (data) {
          $scope.meritems = data.meritems;
          $scope.loader = false;
          $scope.ramt = true;
        }).error(function (data) {
          console.log(data);
          $scope.loader = false;
          $scope.dash = true;
          Materialize.toast('Sorry, it failed', 2000);
        });

      }
      $scope.rpost = function (){
        if(angular.element(document.querySelector('#itemname')).val()!='' && angular.element(document.querySelector('#itemprice')).val())
        {
          $scope.ramt = false;
          $scope.loader = true;
          //now gather the vpa and the amount and hit the py server
          console.log(storage.getItem("pubkey")+" "+angular.element(document.querySelector('#recamount')).val());
          $http({
            url: 'http://172.16.109.252:5000/receiveamount',
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({'vpa': storage.getItem("pubkey"), 'itemname': angular.element(document.querySelector('#itemname')).val(), 'itemprice': angular.element(document.querySelector('#itemprice')).val()})
          }).success(function (data) {
            $http({
              url: 'http://172.16.109.252:5000/meritems',
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              data: JSON.stringify({
                'vpa': storage.getItem("pubkey")
              })
            }).success(function (data) {
              $scope.meritems = data.meritems;
              $scope.loader = false;
              $scope.ramt = true;
              Materialize.toast('Added successfuly!', 2000);

            }).error(function (data) {
              console.log(data);
              $scope.loader = false;
              $scope.dash = true;
              Materialize.toast('Sorry, it failed', 2000);
            });
          }).error(function (data) {
            $scope.loader = false;
            $scope.dash = true;
            Materialize.toast('Failed!', 2000);
          })
        }
        else
        {
          Materialize.toast('Please enter the item name and price', 2000);
        }


      }
    }]);
