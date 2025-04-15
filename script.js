$(document).ready(function () {
  $(".btn-filter").click(function () {
    const filter = $(this).attr("data-filter");

    $(".gallery-item").each(function () {
      const category = $(this).attr("data-category");

      if (filter === "all" || filter === category) {
        $(this).fadeIn(600);
      } else {
        $(this).fadeOut(600);
      }
    });


    $(".btn-filter").removeClass("active");
    $(this).addClass("active");
  });


  $(".gallery-img").click(function () {
    const src = $(this).attr("src");
    $("#fullscreenImage").attr("src", src);
    $("#fullscreenModal").modal("show");
  });

  
  $("#imageSearch").on("input", function () {
    const search = $(this).val().toLowerCase();

    $(".gallery-item").each(function () {
      const altText = $(this).find("img").attr("alt").toLowerCase();

      if (altText.includes(search)) {
        $(this).fadeIn(300);
      } else {
        $(this).fadeOut(300);
      }
    });
  });
});
