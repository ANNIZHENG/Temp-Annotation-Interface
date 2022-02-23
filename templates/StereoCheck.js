const stereo_audio_path = "/templates/interface/assets/audio/stereo/";
const left_filename = "gaussian_rec_46_azimuth_270_elevation_0.wav";
const right_filename = "gaussian_rec_18_azimuth_90_elevation_0.wav";
var filenames = [];

document.addEventListener("click", function(e){
    if(e.target.innerHTML == "Play"){
        document.getElementById("audio"+e.target.id.substring(e.target.id.length-1)).play();
        document.getElementById(e.target.id).disabled = true;
    }
    if(e.target.type == "radio"){
        let id_number = e.target.id.replace('radio-','')[0];
        let side = e.target.id.substring(e.target.id.length-2) == 'ft' ? "left" : "right";
        if (side == "left") document.getElementById('radio-'+id_number+"-right").checked = false;
        else document.getElementById('radio-'+id_number+"-left").checked = false;
    }
});

function randomAssign(){
    while(true){
        let left = 0;
        let right = 0;
        for (let i = 0; i < 6 ; i++){
            let decide = Math.round(Math.random()); // 1 or 0, 1 for left, 0 for right
            if (decide) {
                left += 1;
                filenames.push(left_filename);
            }
            else {
                right += 1;
                filenames.push(right_filename);
            }
        }
        if (left >= 2 && right >= 2){
            break;
        }
        else{
            filenames = [];
        }
    }
}

function setUp(){
    randomAssign();
    let division = document.getElementById('questions');
    for (let i = 0; i < 6; i++){
        let small_div = document.createElement('div');
        let new_audio = document.createElement('audio');
        new_audio.id = 'audio'+i;
        let new_source = document.createElement('source');
        new_source.type = "audio/wav";
        new_source.src = stereo_audio_path + filenames[i];

        let new_button = document.createElement('button');
        new_button.innerHTML = "Play";
        new_button.id = "button"+i;
        new_button.className = "audio-button";

        let span_left = document.createElement('span');
        span_left.innerHTML = "Left:";

        let left_input = document.createElement('input');
        left_input.type = "radio";
        left_input.id = "radio-"+i+'-left';
        left_input.className = "radio";

        let span_right = document.createElement('span');
        span_right.innerHTML = "Right:";

        let right_input = document.createElement('input');
        right_input.type = "radio";
        right_input.id = "radio-"+i+'-right';
        right_input.className = "radio";

        new_audio.appendChild(new_source);
        small_div.appendChild(new_audio);
        small_div.appendChild(new_button);
        small_div.appendChild(span_left);
        small_div.appendChild(left_input);
        small_div.appendChild(span_right);
        small_div.appendChild(right_input);
        division.appendChild(small_div);
    }
}

function ajax_interaction_pass(pass, again){
    let action_type = 'stereo screening: ';
    if (pass){
        action_type += 'pass';
    }
    else{
        if (again){
            action_type += 'fail (will swap headphones)'
        }
        else{
            action_type += 'fail';
        }
    }

    let survey_id = localStorage.getItem("survey_id");
    let value = null;
    let timestamp = Date.now();
    let practice = 0;

    var request = new XMLHttpRequest();
    request.open('POST', '/interaction', true);
    request.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    var data = JSON.stringify({survey_id,action_type,value,timestamp,practice});
    request.send(data);
}

document.getElementById("submit").onclick = function(e){
    let count_opposite = 0;
    for (let i = 0; i < 6; i++){
        if (!document.getElementById('radio-'+i+"-left").checked && !document.getElementById('radio-'+i+"-right").checked){
            // if none of the left or right buttons are checked
            event.preventDefault();
            document.getElementById("main").style.display = 'none';
            let error_text = document.createElement('div');
            error_text.innerHTML = "Screening task failed. Your headphones do not meet the qualifications for the task.";
            document.getElementById("body").appendChild(error_text);
            ajax_interaction_pass(false, false);
            return;
        }
        if (document.getElementById('radio-'+i+"-left").checked){
            if (filenames[i] != left_filename) {
                count_opposite += 1;
            }
        }
        else if (document.getElementById('radio-'+i+"-right").checked){
            if (filenames[i] != right_filename) {
                count_opposite += 1
            }
        }
    }
    if (count_opposite == 6){ // All Error
        event.preventDefault();
        document.getElementById("main").style.display = 'none';
        let warning_text = document.createElement('div');
        warning_text.innerHTML = "Please swap your headphones and try the screening again.";
        let warning_button = document.createElement('button');
        warning_button.innerHTML = "Try Again";
        warning_button.setAttribute("style", "width: 150px;");

        warning_button.onclick = function(){
            let body = document.getElementById("body");
            body.removeChild(warning_button);
            body.removeChild(warning_text);
            let questions = document.getElementById('questions');
            while (questions.firstChild) { 
                questions.removeChild(questions.firstChild); 
            }
            filenames = [];
            setUp();
            document.getElementById('main').style.display = '';
            ajax_interaction_pass(false, true)
            return;
        }
        document.getElementById("body").appendChild(warning_text);
        document.getElementById("body").appendChild(warning_button);
        return;
    } 
    else if (count_opposite == 0){ // No Error
        ajax_interaction_pass(true, false);
        localStorage.setItem('stereo',1);
        window.location = '/templates/interface/practice.html';
        return;
    }
    else{ // Some Error
        event.preventDefault();
        document.getElementById("main").style.display = 'none';
        let error_text = document.createElement('div');
        error_text.innerHTML = "Screening task failed. Your headphones do not meet the qualifications for the task.";
        document.getElementById("body").appendChild(error_text);
        ajax_interaction_pass(false, false);
        return;
    }
};