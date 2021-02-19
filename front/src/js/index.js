function Index(){
    var self = this;
    self.page = 2;
    self.category_id = 0;
    
    self.ul = $(".list-group");
    self.loadMoreBtn = $('#load-more-btn');
    
};

Index.prototype.run = function(){
    this.listenLoadMoreEvent();
    this.listenTabSwitchEvent();
};

Index.prototype.listenLoadMoreEvent = function(){
    var self = this;
    self.loadMoreBtn.click(function(){
        stajax.get({
            'url':'/news/list/',
            'data':{
                'p':self.page,
                'category_id':self.category_id
            },
            'success': function(result){
                if(result['code']===200){
                    var newses = result['data'];
                    if (newses.length>0){
                        var tpl = template("news-item",{"newses":newses});
                        self.ul.append(tpl);
                        self.page ++;
                    }else{
                        self.loadMoreBtn.hide();
                    }
                }
            },
        });
    });
};

Index.prototype.listenTabSwitchEvent = function(){
    var self = this;
    var tab_li = $(".list-tab").children();

    tab_li.click(function(){
        var li = $(this);
        self.category_id = li.attr("data-category");
        var page = 1
        stajax.get({
            'url':'/news/list/',
            'data':{
                'p':page,
                'category_id':self.category_id
            },
            'success': function(result){
                if(result['code']===200){
                    var newses = result['data'];
                    var tpl = template("news-item",{"newses":newses});
                    self.ul.empty().append(tpl);
                    self.page = 2;
                    li.addClass("active").siblings().removeClass("active");
                    self.loadMoreBtn.show();
                }
            },
        });
    });
}

//Create Object
function Banner(){
    //code inside is smilar to __init__ in Python
    //alert("Initing")
    //banner's group element
    this.bannerWidth = 980;
    this.bannerGroup = $("#banner-group");
    //banner's ul element
    this.bannerUl = $('#banner-ul');
    this.bannerList = this.bannerUl.children("li");
    this.bannerCount = this.bannerList.length;
    //banner arrow
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");
    //page Control bullet ul
    this.pageControl = $(".page-control");
    //banner image index
    this.index = 1;
};

//Define Object's Run function
Banner.prototype.run = function(){
    this.listenHover();
    this.listenArrowClick();
    this.initPageControl();
    this.initBanner();
    this.listenPageControl();
    this.loop();
};

//dynamically calc banner width and insert css
Banner.prototype.initBanner = function(){
    var self = this;
    var firstBanner = self.bannerList.eq(0).clone();
    var lastBanner = self.bannerList.eq(self.bannerCount-1).clone();
    self.bannerUl.append(firstBanner);
    self.bannerUl.prepend(lastBanner);
    self.bannerUl.css({"width": self.bannerWidth * (self.bannerCount+2), 
    "left":-self.bannerWidth});
}

//init bullet control
Banner.prototype.initPageControl = function(){
    var self = this;
    self.pageControl = $(".page-control");
    for (var i=0; i<(self.bannerCount); i++){
        var circle = $("<li></li>")
        self.pageControl.append(circle);
        if (i===0){
            circle.addClass("active");
        }
    }
    self.pageControl.css({"width": (12+16)*self.pageControl.children("li").length})
};

//toggle banner arrow
Banner.prototype.toggleArrow = function(){
    //show or not show toggle switch.
    this.leftArrow.toggle();
    this.rightArrow.toggle();
}

//Listen hover event
Banner.prototype.listenHover = function(){
    var self = this
    this.bannerGroup.hover(function(){
        //hover over
        clearInterval(self.timer);
        self.leftArrow.show();
        self.rightArrow.show();
    },function(){
        //hover out
        self.loop();
        self.toggleArrow()
    })
};

//Listen arrow click event
Banner.prototype.listenArrowClick = function(){
    var self = this;
    this.leftArrow.click(function(){
        if(self.index===0){
            self.bannerUl.css({"left":-self.bannerWidth*self.bannerCount});
            self.index=self.bannerCount - 1;
        }else{
            self.index--;
        }
        self.animate();
    });

    this.rightArrow.click(function(){
        if (self.index >= self.bannerCount+1){
            self.bannerUl.css({"left":-self.bannerWidth})
            self.index = 2;
        }else{
            self.index++;
        }
        self.animate();
    })
}

//Listen page control bullet ul
Banner.prototype.listenPageControl = function(){
    var self = this;
    self.pageControl.children("li").each(function(index, obj){
        // console.log(index);
        // console.log(obj);
        // console.log("==============");
        $(obj).click(function(){
            self.index = index+1;
            self.animate();
        });
    })
}

//Banner animate
Banner.prototype.animate = function(){
    var self = this;
    self.bannerUl.stop().animate({"left":-self.bannerWidth*self.index}, 800);
    if(self.index>=1 && self.index<=self.bannerCount){
        index = self.index-1;
    }else if(self.index===0){
        index = self.bannerCount-1;
    }else{
        index = 0;
    }
    self.pageControl.children("li").eq(index).addClass("active").siblings().removeClass("active");
};

//Loop banner image
Banner.prototype.loop = function(){
    var self = this;
    //acheive auto play
    this.timer = setInterval(function(){
        if (self.index >= self.bannerCount+1){
            self.bannerUl.css({"left":-self.bannerWidth})
            self.index = 2;
        }else{
            self.index++;
        }
        self.animate();
    }, 5000);
};

//make sure all html elemts rendered.
$(function(){
    var banner = new Banner();
    banner.run();

    var index = new Index();
    index.run();
});