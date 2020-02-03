var inputType = "string";
var stepped = 0, rowCount = 0, errorCount = 0, firstError;
var start, end;
var firstRun = true;
var maxUnparseLength = 10000;

function parse() {
    stepped = 0;
    rowCount = 0;
    errorCount = 0;
    firstError = undefined;

    var config = buildConfig();

    $('#files').parse({
        config: config,
        before: function (file, inputElem) {
            start = now();
            console.log("Parsing file...", file);
        },
        error: function (err, file) {
            console.log("ERROR:", err, file);
            firstError = firstError || err;
            errorCount++;
        },
        complete: function () {
            end = now();
            printStats("Done with all files");
        }
    });
}

function printStats(msg) {
    if (msg)
        console.log(msg);
    console.log("       Time:", (end - start || "(Unknown; your browser does not support the Performance API)"), "ms");
    console.log("  Row count:", rowCount);
    if (stepped)
        console.log("    Stepped:", stepped);
    console.log("     Errors:", errorCount);
    if (errorCount)
        console.log("First error:", firstError);
}

function buildConfig() {
    return {
        delimiter: ',',
        header: $('#header').prop('checked'),
        dynamicTyping: $('#dynamicTyping').prop('checked'),
        skipEmptyLines: $('#skipEmptyLines').prop('checked'),
        preview: parseInt($('#preview').val() || 0),
        step: $('#stream').prop('checked') ? stepFn : undefined,
        encoding: $('#encoding').val(),
        worker: $('#worker').prop('checked'),
        comments: $('#comments').val(),
        complete: completeFn,
        error: errorFn,
        download: inputType == "remote"
    };
}

function stepFn(results, parser) {
    stepped++;
    if (results) {
        if (results.data)
            rowCount += results.data.length;
        if (results.errors) {
            errorCount += results.errors.length;
            firstError = firstError || results.errors[0];
        }
    }
}

function completeFn(results) {
    end = now();

    if (results && results.errors) {
        if (results.errors) {
            errorCount = results.errors.length;
            firstError = results.errors[0];
        }
        if (results.data && results.data.length > 0)
            rowCount = results.data.length;
    }

    var list = new Array();

    for (var i = 0; i < results.data.length; i++) {
        array = results.data[i];
        if (i > 0) {
            list.push({
                "Date": date,
                "Time": time,
                "Age": age,
                "Height": height,
                "Weight": weight,
                "BMI": bmi,
                "Fat %": fatPercent,
                "Fat right arm": fatRightArm,
                "Fat left arm": fatLeftArm,
                "Fat right leg": fatRightLeg,
                "Fat left leg": fatLeftLeg,
                "Fat torso/chest": fatTorso,
                "Muscle %": musclePercent,
                "Muscle right arm": muscleRightArm,
                "Muscle left arm": muscleLeftArm,
                "Muscle right leg": muscleRightLeg,
                "Muscle left leg": muscleLeftLeg,
                "Muscle torso/chest": muscleTorso,
                "Bone mass": boneMass,
                "Body water %": bodyWater,
                "Metabolic age": metabolicAge
            });
        }
        for (var j = 0; j < array.length; j++) {
            if (array[j] == "DT") {
                date = array[j + 1];
            }
            else if (array[j] == "Ti") {
                time = array[j + 1];
            }
            else if (array[j] == "AG") {
                age = array[j + 1];
            }
            else if (array[j] == "Hm") {
                height = array[j + 1];
            }
            else if (array[j] == "Wk") {
                weight = array[j + 1];
            }
            else if (array[j] == "MI") {
                bmi = array[j + 1];
            }
            else if (array[j] == "FW") {
                fatPercent = array[j + 1];
            }
            else if (array[j] == "Fr") {
                fatRightArm = array[j + 1];
            }
            else if (array[j] == "Fl") {
                fatLeftArm = array[j + 1];
            }
            else if (array[j] == "FR") {
                fatRightLeg = array[j + 1];
            }
            else if (array[j] == "FL") {
                fatLeftLeg = array[j + 1];
            }
            else if (array[j] == "FT") {
                fatTorso = array[j + 1];
            }
            else if (array[j] == "mW") {
                musclePercent = array[j + 1];
            }
            else if (array[j] == "mr") {
                muscleRightArm = array[j + 1];
            }
            else if (array[j] == "ml") {
                muscleLeftArm = array[j + 1];
            }
            else if (array[j] == "mR") {
                muscleRightLeg = array[j + 1];
            }
            else if (array[j] == "mL") {
                muscleLeftLeg = array[j + 1];
            }
            else if (array[j] == "mT") {
                muscleTorso = array[j + 1];
            }
            else if (array[j] == "bW") {
                boneMass = array[j + 1];
            }
            else if (array[j] == "ww") {
                bodyWater = array[j + 1];
            }
            else if (array[j] == "rA") {
                metabolicAge = array[j + 1];
            }
        }
    }

    var csv = Papa.unparse(list, {
        delimiter: $("#delimiter").val()
    });
    localStorage.setItem("csvData", csv);

    $("#parsingSuccess").css("display", "block");
    $("#download").css("display", "block");
}

function download() {
    var fileName = $("#fileName").val();
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem("csvData"));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", fileName + ".csv");
    dlAnchorElem.click();
}

function errorFn(err, file) {
    end = now();
    console.log("ERROR:", err, file);
    enableButton();
}

function now() {
    return typeof window.performance !== 'undefined'
        ? window.performance.now()
        : 0;
}
