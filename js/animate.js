function animateDangerBar(threatLevel) {
    var percentage = 50;
    const test = document.getElementById("foo");
    console.log(test);
    console.log("foo");
    console.log($("#foo"));
    $(test)
        .animate({
            "width": percentage + "%"
        }, {
            duration: 600,
            easing: 'linear'
        });
}
