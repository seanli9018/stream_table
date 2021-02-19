function NewsCategory(){

};

NewsCategory.prototype.run = function(){
    var self = this;
    self.listenAddCategory();
    self.listenEditCategory();
    self.listenDeleteCategory();
};

NewsCategory.prototype.listenAddCategory = function(){
    var categoryAddBtn = $("#add-category")
    categoryAddBtn.click(function(){
        stalert.alertOneInput({
            'title': 'Add category',
            'placeholder': 'Please enter a news category',
            'confirmText': 'Add',
            'cancelText':'Cancel',
            'confirmCallback': function(inputValue){
                stajax.post({
                    'url':'/cms/add_news_category/',
                    'data': {
                        "name":inputValue,
                    },
                    'success': function(result){
                        if(result['code']===200){
                            window.location.reload();
                        }else{
                            stalert.close();
                        };
                    },
                });
            }
        });
    });
};

NewsCategory.prototype.listenEditCategory = function(){
    var self = this;
    var editBtn = $(".edit-btn");
    editBtn.click(function(){
        var currentBtn = $(this);
        var tr = currentBtn.parent().parent();
        var pk = tr.attr("data-pk");
        var name = tr.attr("data-name");
        stalert.alertOneInput({
            'title': 'Edit category',
            'value': name,
            'confirmText': 'Edit',
            'cancelText':'Cancel',
            'confirmCallback': function(inputValue){
                stajax.post({
                    'url':'/cms/edit_news_category/',
                    'data': {
                        "name": inputValue,
                        "pk": pk,
                    },
                    'success': function(result){
                        if(result['code']===200){
                            window.location.reload();
                        }else{
                            stalert.close();
                        };
                    }
                });
            }
        });
    });
};

NewsCategory.prototype.listenDeleteCategory = function(){
    var self = this;
    var deleteBtn = $(".delete-btn");

    deleteBtn.click(function(){
        var currentBtn = $(this);
        var tr = currentBtn.parent().parent();
        var pk = tr.attr("data-pk");
        var name = tr.attr("data-name");
        stalert.alertConfirm({
            'title': 'Warning',
            'text': 'Are you sure you want to delete '+name+' ?',
            'confirmText': 'Delete',
            'cancelText':'Cancel',
            'confirmCallback': function(inputValue){
                stajax.post({
                    'url':'/cms/delete_news_category/',
                    'data': {
                        "pk": pk,
                    },
                    'success': function(result){
                        if(result['code']===200){
                            window.location.reload();
                        }else{
                            stalert.close();
                        };
                    }
                });
            }
        });
    });
}

$(function(){
    var news_category = new NewsCategory();
    news_category.run();
})