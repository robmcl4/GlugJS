var API_BASE = "http://localhost:3000"

function displayDetails(poster, runtime, desc) {
  $("#title-details .desc").html(desc);
  $("#title-details .runtime").html(Math.round(runtime/60));
  var src = "https://image.tmdb.org/t/p/w396/" + poster;
  $("#title-details .cover-poster").attr("src", src);
}


function displayWords(runtime, words, title, imdb_id) {
  $("#title-details .movie-title").html(title);
  $("#title-details .runtime").html(Math.round(runtime/60));
  $("#title-details .imdb-link").attr("href", "http://www.imdb.com/title/" + imdb_id)

  NProgress.done();
  $("#candidate-words").removeClass("hidden");
  $("#candidate-titles").addClass("hidden");

  var template = $("#candidate-words .template .candidate-word").clone().removeClass("hidden");
  var container = $("#candidate-words .container");
  container.html("");
  for (var i=0; i<words.length; i++) {
    var word = words[i];
    word.word = word.word[0].toUpperCase() + word.word.substring(1);
    var curr = template.clone();
    curr.find(".word").html(word.word);
    curr.find(".occurances").html(word.occurances.length);

    var occurances = word.occurances;
    for (var j=0; j < occurances.length; j++) {
      var occ = occurances[j];
      var perc = Math.round(100 * occ / runtime);
      curr.find(".line").append("<div class=\"dot\" style=\"left: " + perc + "%\"></div>");
    }

    container.append(curr);
  }

  var url = API_BASE + "/title/" + encodeURIComponent(imdb_id);
  console.log(url);
  $.ajax({
    url: url,
    success: (obj) => displayDetails(obj.poster, obj.runtime, obj.overview),
    error: () => console.log('Could not get details of movie')
  })
}


function getWordsFor(href, title) {
  var quoted = encodeURIComponent(href);
  var url = API_BASE + "/words/" + quoted;
  NProgress.start();
  $.ajax({
    url: url,
    success: function(obj) {
      console.log(obj);
      displayWords(obj.runtime, obj.ranked_words, title, obj.imdbid)
    },
    error: () => displayError("Could not find best words")
  });
}


function displayMovieTitles(candidates) {
  NProgress.done();
  $("#candidate-titles").removeClass("hidden");
  $("#candidate-words").addClass("hidden");
  var template = $("#candidate-titles .template .candidate-title").clone().removeClass("hidden");
  var container = $("#candidate-titles .container");
  container.html("");
  for (var i=0; i<candidates.length; i++) {
    let candidate = candidates[i];
    var curr = template.clone();
    curr.find("a")
      .attr("href", "#")
      .click(function() {
          getWordsFor(candidate.href, candidate.title);
      });
    curr.find(".movie-title").html(candidate.title);
    curr.find(".sub-count").html(candidate.subs);
    container.append(curr);
  }
}

function displayError(msg) {
  NProgress.done();
  $("#alert-box")
    .css("display", "")
    .removeClass("hidden")
    .find(".message")
    .html(msg);
}

function submitMovieTitle(title) {
  var quoted = encodeURIComponent(title);
  var url = API_BASE + "/titles/" + quoted;
  NProgress.start();
  $.ajax({
    url: url,
    success: displayMovieTitles,
    error: () => displayError("Could not get candidate titles.")
  });
}

$(document).ready(function() {
  $("#movie-title-form").submit(function() {
    submitMovieTitle($("#movie-title-input").val())
  });
});
