$(document).ready(function () {
    $('.image').on('change', function () {
        // Activate model after image select
        $('.modal-bg').addClass('bg-active')
        $('.image_demo').croppie('destroy');
        $('.image-label').attr('value', '');
        $image_crop = $('.image_demo').croppie({
            enableExif: true,
            viewport: {
                width: 200,
                height: 200,
                type: 'square' //circle
            },
            boundary: {
                width: 300,
                height: 300
            }
        });
        var reader = new FileReader();
        reader.onload = function (event) {
            $image_crop.croppie('bind', {
                url: event.target.result
            }).then(function () {
                console.log('jQuery bind complete');
            });
        }
        reader.readAsDataURL(this.files[0]);
        $('.close-icon ').on('click', function () {
            $('.modal-bg').removeClass('bg-active')
        })
        $('.crop-btn').click(function (event) {
            $image_crop.croppie('result', {
                type: 'canvas',
                size: 'viewport'
            }).then(function (response) {
                console.log('response', response)
                $('.displayImg').attr('src', response);
                // const base64Data = response.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                $('.image-label').attr('value', response);
                $('.modal-bg').removeClass('bg-active')
            });
        })
    })
})