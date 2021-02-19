function CourseDetail(){

}

CourseDetail.prototype.initPlayer = function(){
    var spanVideo = $('#video-info');
    var video_url = spanVideo.attr('data-video-url');
    var cover_url = spanVideo.attr('data-cover-url');
    console.log('haha')
    var player = cyberplayer("playercontainer").setup({
        width: 980,
        height: 500,
        file: video_url,
        image: cover_url,
        autostart: false,
        stretching: "uniform",
        repeat: false,
        volume: 100,
        controls: true,
        tokenEncrypt: true,
        ak: 'ade4f7defebf4cdb9c12a0d612d37917'
    });
    
    player.on('beforePlay',function (e) {
        if(!/m3u8/.test(e.file)){
            return;
        }
        stajax.get({
            'url': '/course/course_token/',
            'data': {
                'video': video_url,
            },
            'success': function (result) {
                if(result['code'] === 200){
                    console.log('haha');
                    var token = result['data']['token'];
                    player.setToken(e.file,token);
                }else{
                    window.messageBox.showInfo(result['message']);
                    player.stop();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};

CourseDetail.prototype.run = function(){
    var self = this;
    self.initPlayer();
};


$(function(){
    var course_detail = new CourseDetail();
    course_detail.run();
})