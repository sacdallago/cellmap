$('.special.cards .image').dimmer({
    on: 'hover'
});

$('.ui.red.button.attached').on('click', function(event) {
    let iid = $(this).data('iid');

    $.ajax({
        url: '/api/maps/' + iid,
        type: 'DELETE',
        success: function() {
            window.location.reload()
        },
        error: function (e) {
            console.error(e);
        }
    });
});