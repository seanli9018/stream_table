function News(){

};

News.prototype.run = function(){
    var self = this;
    //upload to our own server media folder
    //self.listenUploadEvent();
    self.listenQiniuUploadFileEvent();
    self.initUEditor();
    self.listenSubmitEvent();
};

News.prototype.listenSubmitEvent = function(){
    var submitBtn = $('#submit-btn');
    submitBtn.click(function(event){
        event.preventDefault();
        
        var btn = $(this);
        var pk = btn.attr('data-news-id');
        var title = $("input[name='title']").val();
        var category = $("select[name='category']").val();
        var desc = $("input[name='description']").val();
        var thumbnail = $("input[name='thumbnail']").val();
        var content = window.ue.getContent();
        var url = '';
        var successMessage = '';
        if(pk){
            url = '/cms/edit_news/';
            successMessage = 'Your article has been edited!';
        }else{
            url = '/cms/write_news/';
            successMessage = 'Your article has been posted!';
        }

        stajax.post({
            'url': url,
            'data': {
                'title': title,
                'category': category,
                'desc': desc,
                'thumbnail': thumbnail,
                'content': content,
                'pk': pk,
            },
            'success': function(result){
                if(result['code']===200){
                    stalert.alertSuccess(successMessage, function(){
                        window.location.reload();
                    });
                }
            }
        })
    })
}

//init ueditor 
News.prototype.initUEditor = function(){
    //bind ue to window to make it a global variable
    window.ue = UE.getEditor('editor',{
        'serverUrl':'/ueditor/upload/',
        'initialFrameHeight': 350,
        'initialFrameWidth': '100%',
        'lang': 'en',
    });

}

//upload image to our own server media folder
News.prototype.listenUploadEvent = function(){
    var self = this;
    var uploadBtn = $("#thumbnail-btn");
    uploadBtn.change(function(){
        // the file is in the Btn list
        var file = uploadBtn[0].files[0];

        //need formdata to save and pass the file
        var formData = new FormData();
        formData.append('file', file);

        //use ajax to upload picture
        stajax.post({
            'url':'/cms/upload/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function(result){
                if(result['code']===200){
                    var thumbnailInput = $("#thumbnail-form");
                    thumbnailInput.val(result['data']['url'])
                }
            }
        });
    });
};

//upload image to qiniu cloud server
News.prototype.listenQiniuUploadFileEvent = function(){
    var self = this;
    var uploadBtn = $("#thumbnail-btn");

    uploadBtn.change(function(){
        var file = this.files[0];
        stajax.get({
            'url':'/cms/qntoken',
            'success': function(result){
                if(result['code']===200){
                    //get token from backend views.py
                    var token = result['data']['token'];
                    var key = (new Date()).getTime() + '.' + file.name.split('.')[1];
                    var putExtra = {
                        fname: key,
                        param:{},
                        mimeType:['image/png',],
                    };
                    var config = {
                        useCdnDomain: true,
                        retryCount: 6,
                        region: qiniu.region.na0
                    };

                    var observable = qiniu.upload(file, key, token, putExtra, config);
                    observable.subscribe({
                        'next': self.handleFileUploadProgress,
                        'error': self.handleFileUploadError,
                        'complete': self.handleFileUploadComplete,
                    })
                };
            }
        })
    });
};

//qiniu response handling for progress percentage.
News.prototype.handleFileUploadProgress = function(response){
    var total = response.total;
    var percent = total.percent;
    var percentText = percent.toFixed(0) + '%';
    progressGroup = News.progressGroup;
    progressBar = News.progressBar;
    News.progressBar.css({"width":"0%"});
    News.progressGroup.show();
    progressBar.css({"width":percentText});
    progressBar.text(percentText);
}

News.prototype.handleFileUploadError = function(error){
    window.messageBox.showError(error.message);
    progressGroup = News.progressGroup;
    progressGroup.hide();
}

News.prototype.handleFileUploadComplete = function(response){
    progressGroup = News.progressGroup;
    progressGroup.hide();

    var domain = 'http://qdh7iftcs.bkt.gdipper.com/';
    var filename = response.key;
    var url = domain + filename;
    var thumbnailInput = News.thumbnailInput;
    thumbnailInput.val(url);

}

$(function(){
    var news = new News();
    news.run();
    News.progressGroup = $('#progress-group');
    News.progressBar = $('#progress-bar');
    News.thumbnailInput = $("#thumbnail-form");
});