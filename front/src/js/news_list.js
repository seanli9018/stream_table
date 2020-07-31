function CMSNewsList(){

}

CMSNewsList.prototype.run = function(){
    var self = this;
    self.initDatePicker();
    self.listenDeleteNews();
};

CMSNewsList.prototype.initDatePicker = function(){
    startPicker = $("#start-picker");
    endPicker = $("#end-picker");

    todayDate = new Date();
    var todayStr = (todayDate.getMonth()+1) + '/' + todayDate.getDate() + '/' + todayDate.getFullYear()
    //console.log(todayDate);

    var options = {
        'showButtonPanel':true,
        'startDate': '05/01/2020',
        'endDate': todayStr,
        'todayBtn': 'linked',
        'clearBtn': true,
        'autoclose': true,
        'todayHighlight': true
    }
    startPicker.datepicker(options);
    endPicker.datepicker(options);

}

CMSNewsList.prototype.listenDeleteNews = function(){
    var deleteBtns = $(".delete-btn")
    deleteBtns.click(function(){
        var btn = $(this);
        var news_id = btn.attr('data-news-id');
        stalert.alertConfirm({
            'text':'Are you sure you want to delete this article?',
            'confirmCallback':function(){
                stajax.post({
                    'url':'/cms/delete_news/',
                    'data': {
                        'news_id': news_id
                    },
                    'success':function(result){
                        if(result['code'] === 200){
                            //window.location = window.location.href;
                            window.location.reload();
                        }
                    }
                })
            },
        })
    })
}

$(function(){
    var newsList = new CMSNewsList;
    newsList.run();
})