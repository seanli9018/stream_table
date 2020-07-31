// For nav bar actions.
function FrontBase(){
    
};

FrontBase.prototype.run = function(){
    var self = this;
    self.listenAuthBoxHover();
};

FrontBase.prototype.listenAuthBoxHover = function(){
    var authBox = $(".auth-box");
    var userMoreBox = $(".user-more-box");

    authBox.hover(function(){
        userMoreBox.show();
    }, function(){
        userMoreBox.hide();
    });
};

//For Signin and register actions.
function Auth(){
    var self = this;
    self.maskWrapper = $(".mask-wrapper");
    self.scrollWrapper = $('.scroll-wrapper');
    self.emailCaptchaBtn = $(".email-capture-btn");
};

Auth.prototype.run = function(){
    var self = this;
    self.listenClick();
    self.listenSwitch();
    self.listenSigninEvent();
    self.listenImgCaptchaEvent();
    self.listenCodeCaptchaEvent();
    self.listenSignupEvent();
};

Auth.prototype.showEvent = function(){
    var self = this;
    self.maskWrapper.show();
};

Auth.prototype.hideEvent = function(){
    var self = this;
    self.maskWrapper.hide();
};

Auth.prototype.listenClick = function(){
    var self = this;
    var signinBtn = $('.signin-btn');
    var signupBtn = $('.signup-btn');
    var closeBtn = $('#close-btn');

    signinBtn.click(function(){
        self.showEvent();
        self.scrollWrapper.css({"left":0});
     });

    signupBtn.click(function(){
        self.showEvent();
        self.scrollWrapper.css({"left":-400});
    });

    closeBtn.click(function(){
        self.hideEvent();
    });
};

Auth.prototype.listenSwitch = function(){
    var self = this;
    var switcher = $(".switch");
    switcher.click(function(){
        var currentLeft = self.scrollWrapper.css("left");
        currentLeft = parseInt(currentLeft);
        if (currentLeft < 0){
            self.scrollWrapper.animate({"left": "0"});
        }else{
            self.scrollWrapper.animate({"left": "-400px"});
        }
    });
};

Auth.prototype.listenSigninEvent = function(){
    var self = this;
    var signinGroup = $(".signin-group");
    var emailInput = signinGroup.find("input[name='email']");
    var passwordInput = signinGroup.find("input[name='password']");
    var rememberInput = signinGroup.find("input[name='remember']");

    var submitBtn = signinGroup.find(".submit-btn");

    submitBtn.click(function(){
        var email = emailInput.val();
        var password = passwordInput.val();
        var remember = rememberInput.prop("checked");
        
        stajax.post({
            'url':"/account/login/",
            'data':{
                'email': email,
                'password': password,
                'remember': remember?1:0,
            },
            'success':function(result){
                if(result['code']===200){
                    self.hideEvent();
                    window.location.reload();
                }
            },
        })

    });
};

Auth.prototype.listenSignupEvent = function(){
    var self = this;
    var signupGroup = $(".signup-group");
    var signupBtn = signupGroup.find(".submit-btn");

    signupBtn.click(function(event){
        event.preventDefault();
        var emailInput = signupGroup.find("input[name='email']");
        var usernameInput = signupGroup.find("input[name='username']");
        var password1Input = signupGroup.find("input[name='password1']");
        var password2Input = signupGroup.find("input[name='password2']");
        var imgCaptchaInput = signupGroup.find("input[name='img_capture']");
        var emailCaptchaInput = signupGroup.find("input[name='email_capture']");
        var email = emailInput.val();
        var username = usernameInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var imgCaptcha = imgCaptchaInput.val();
        var emailCaptcha = emailCaptchaInput.val();

        stajax.post({
            'url': '/account/register/',
            'data': {
                'email': email,
                'username': username,
                'password1': password1,
                'password2': password2,
                'img_captcha': imgCaptcha,
                'email_captcha': emailCaptcha,
            },
            'success': function(result){
                if(result['code']===200){
                    self.hideEvent();
                    window.location.reload();
                }
            },
        });

    });

}

Auth.prototype.listenImgCaptchaEvent = function(){
    var imgCaptcha = $("#img_captcha");
    
    imgCaptcha.click(function(){
        imgCaptcha.attr("src", "/account/img_captcha/"+"?random="+Math.random())
    });
};

Auth.prototype.emailSuccessEvent = function(){
    var self = this;
    window.messageBox.showSuccess("Your verification code has been sent.");
    self.emailCaptchaBtn.addClass("disabled");
    var count = 60;
    self.emailCaptchaBtn.unbind('click');
    timer = setInterval(function(){
        self.emailCaptchaBtn.text(count+'s');
        count -= 1;
        if(count <= 0){
            clearInterval(timer);
            self.emailCaptchaBtn.removeClass("disabled");
            self.emailCaptchaBtn.text("Get Code");
            self.listenCodeCaptchaEvent();
        }
    }, 1000);
};

Auth.prototype.listenCodeCaptchaEvent = function(){
    var self = this;
    var emailSignupInput = $(".signup-group input[name='email']");
    self.emailCaptchaBtn.click(function(){
        var email = emailSignupInput.val();
        if(email){
            stajax.get({
                'url': '/account/email_captcha/',
                'data': {
                    'email': email,
                },
                'success': function(result){
                    self.emailSuccessEvent();
                },
            });
        }else{
            window.messageBox.showError("Please enter your email.")
        };
    });
}


$(function(){
    var auth = new Auth();
    auth.run();
})

$(function () { 
    var frontBase = new FrontBase();
    frontBase.run();
});

//arttemplate common filters
$(function(){
    if(window.template){
        //arttemplate custom filter//
        template.defaults.imports.timeSince = function(dateValue){
            var date = new Date(dateValue);
            var datets = date.getTime(); //milliseconds
            var nowts = (new Date()).getTime(); //milliseconds

            var timestamp = (nowts - datets)/1000; //seconds diff
            if (timestamp < 60){
                return 'just now';
            }else if(timestamp >= 60 && timestamp < 60*60){
                minutes = parseInt(timestamp/60);
                return minutes + "minutes ago";
            } else if(timestamp >= 60*60 && timestamp < 24*60*60){
                hours = parseInt(timestamp/60/60)
                return hours + "hours ago";
            } else if(timestamp >= 24*60*60 && timestamp < 30*24*60*60){
                days = parseInt(timestamp/60/60/24)
                return days + "days ago";
            } else{
                var year = dateValue.getFullYear();
                var month = dateValue.getMonth();
                var day = dateValue.getDate();
                var hour = dateValue.getHours();
                var minute = dateValue.getMinutes();

                return month + '/' + day + '/' + year + ' ' + hour + ':' + minute;
            }
        };
    }
});

