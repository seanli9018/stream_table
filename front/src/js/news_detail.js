function CommentList(){

}

CommentList.prototype.run = function(){
    this.listenCommentSubmitEvent();
};

CommentList.prototype.listenCommentSubmitEvent = function(){
    var submitBtn = $("#comment-btn");
    var textarea = $("textarea[name='comment']");
    submitBtn.click(function(){
        var content = textarea.val();
        var news_id = $(this).parent().attr('news_id');
        //console.log (news_id);

        stajax.post({
            'url':'/news/public_comment/',
            'data':{
                'content': content,
                'news_id': news_id,
            },
            'success':function(result){
                if(result['code']===200){
                    var comment = result['data']
                    var tpl = template('comment-item', {'comment':comment})
                    var commentListGroup = $('.comment-list');
                    commentListGroup.prepend(tpl);
                    window.messageBox.showSuccess("Your comment has been successfully posted!");
                    textarea.val("");
                }else{
                    window.messageBox.showError(result["message"])
                }
            }
        })

    })
}

$(function(){
    var comment = new CommentList;
    comment.run();
})