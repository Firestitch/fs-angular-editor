$.Redactor.prototype.save = function()
{
    return {
        save: function(func)
        {
            func();
        }
    };
};