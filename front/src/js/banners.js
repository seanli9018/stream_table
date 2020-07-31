function Banners(){

}

Banners.prototype.loadData = function(){
    var self = this;
    stajax.get({
        'url': '/cms/banner_list/',
        'success': function(result){
            if(result['code']===200){
                var banners = result['data'];
                for(var i=0; i<banners.length; i++){
                    var banner = banners[i];
                    self.creatBannerItem(banner);
                }
            }
        }
    })
};

Banners.prototype.creatBannerItem = function(banner){
    var self = this;
    var tpl = template("banner-item", {'banner':banner});
    var bannerGroup = $(".banner-group");

    var bannerItem = null;
    if(banner){
        bannerGroup.append(tpl);
        bannerItem = bannerGroup.find(".banner-item:last");
    }else{
        bannerGroup.prepend(tpl);
        bannerItem = bannerGroup.find(".banner-item:eq(0)");
    }
    self.addImageSelectEvent(bannerItem);
    self.removeBannerEvent(bannerItem);
    self.addSaveBannerEvent(bannerItem); 
}

Banners.prototype.listenAddBannerEvent = function(){
    var self = this;
    var addBannerBtn = $("#add-banners");
    addBannerBtn.click(function(){
        var bannerGroup = $('.banner-group');
        var length = bannerGroup.children().length;
        if(length >= 6){
            window.messageBox.showInfo('Maxium 6 banners can be added.')
            return;
        }
        self.creatBannerItem();
    });
}

Banners.prototype.addImageSelectEvent = function(bannerItem){
    var image = bannerItem.find(".thumbnail");
    var imageInput = bannerItem.find(".image-input");
    //image can not open file windows.
    //only via input tag with type:file.
    image.click(function(){
        imageInput.click();
    });

    imageInput.change(function(){
        var file = this.files[0];
        var formData = new FormData();
        formData.append("file", file);

        stajax.post({
            'url': '/cms/upload/',
            'data': formData,
            'processData':false,
            'contentType':false,
            'success': function(result){
                if (result['code']===200){
                    var url = result['data']['url'];
                    image.attr('src', url);
                }
            }
        })
    })
};

Banners.prototype.addSaveBannerEvent = function(bannerItem){
    var saveBtn = bannerItem.find("#save-btn");
    var image = bannerItem.find(".thumbnail");
    var priorityTag = bannerItem.find("input[name='priority']");
    var linktoTag = bannerItem.find("input[name='link_to']");
    var prioritySpan = bannerItem.find("span[class='priority']");
    var bannerId = bannerItem.attr('data-banner-id');
    if(bannerId){
        url = '/cms/edit_banner/';
    }else{
        url = '/cms/add_banner/';
    }
    saveBtn.click(function(){
        var image_url = image.attr('src');
        var priority = priorityTag.val();
        var link_to = linktoTag.val();

        stajax.post({
            'url': url,
            'data': {
                'image_url': image_url,
                'priority': priority,
                'link_to': link_to,
                'pk': bannerId,
            },
            'success':function(result){
                if(result['code']===200){
                    if(bannerId){
                        window.messageBox.showSuccess('Sucessfully edited!');
                    }else{
                        var banner_Id = result['data']['banner_id'];
                        bannerItem.attr('data-banner-id',banner_Id);
                        window.messageBox.showSuccess('Sucessfully saved!');
                    }
                    prioritySpan.text('Priority: '+ priority);
                }
            }
        })
    })
}

Banners.prototype.removeBannerEvent = function(bannerItem){
    var closeBtn = bannerItem.find(".close-btn");
    closeBtn.click(function(){
        var bannerId = bannerItem.attr('data-banner-id');
        console.log(bannerId);
        if(bannerId){
            stalert.alertConfirm({
                'text': "Are you sure you want to delete this banner?",
                'confirmCallback': function(){
                    stajax.post({
                        'url':'/cms/delete_banner/',
                        'data':{
                            'banner_id':bannerId,
                        },
                        'success':function(result){
                            if(result['code']===200){
                                bannerItem.remove();
                                window.messageBox.showSuccess('Sucessfully deleted!');
                            }
                        }
                    })
                }
            })
        }else{
            bannerItem.remove();
        }
    });
}

Banners.prototype.run= function(){
    this.listenAddBannerEvent();
    this.loadData();
}

$(function(){
    var banners = new Banners();
    banners.run();
})