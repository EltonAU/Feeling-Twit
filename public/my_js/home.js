var shouldAskAgain = true;

function stopServer(){
//    change(1,1,1);
    shouldAskAgain= false;
    console.log("stoop3");
    $.ajax({
        url: "/stop",
        type: 'GET',
        success: function(result){
        // Perform operation on return value
        //var response = JSON.parse(result)
            //document.getElementById("result").innerHTML = result;
        //document.getElementById("result").innerHTML = result.statuses[0].text;
        document.getElementById("resultParent").getElementsByClassName("result")[0].innerHTML = "What people feel about: " + document.getElementById("text_input").value + " (Stopped...)";
        },
        error:function(data){
            console.log("Error: " + data);
        },
        complete:function(data){
            
        }
    });
}

function GetData(){
    change(1,1,1);
    fetchdata();
    shouldAskAgain = true;
}

function fetchdata(){
    try{
        $.ajax({
            url: "/q?keyword=" + document.getElementById("text_input").value,
            type: 'GET',
            success: function(result){
            // Perform operation on return value
            //var response = JSON.parse(result)
                //document.getElementById("result").innerHTML = result;
                change(1,1,1);
                //console.log("wow");
                document.getElementById("resultParent").getElementsByClassName("result")[0].innerHTML = "What people feel about: " + document.getElementById("text_input").value + " (Running...)";
             //   document.getElementById("result").innerHTML = "What people feel about: " + document.getElementById("text_input").value;
            //document.getElementById("result").innerHTML = result.statuses[0].text;
            },
            error:function(data){
                console.log("Error: " + data);
            },
            complete:function(data){
                console.log("adad");
                setTimeout(GetUpdateData,2000);
            }
        });
    }catch (exception){

    }
    
}

function GetUpdateData(){
    try{
        $.ajax({
            url: "/u",
            type: 'GET',
            success: function(result){
                var res = result.split(",");
                if(shouldAskAgain){
                    if(res[0] == 0 || res[1] == 0 || res[2] == 0){
    
                    }else{
                        change(res[0], res[1], res[2]);
                        
                    }
                    
                }
              //  document.getElementById("result").innerHTML = "What people feel about: " + document.getElementById("text_input").value;
            },
            
            error:function(data){
                console.log("Error: " + data);
                shouldAskAgain = false;
            },
            complete:function(data){
                if(shouldAskAgain){
                    setTimeout(GetUpdateData,2000);
                }
            }
        });
    }catch(exception){

    }
    
}

function getTweets(){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://localhost:3000/q?keyword=" + document.getElementById("text_input").value + " &count=" + document.getElementById("count_input").value);
    xhr.send();
    
    xhr.onreadystatechange = processKeyword;
    function processKeyword(e){
        if(xhr.responseText == "Error"){
            alert("Cannot get data");
            return;
        }
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById("result").innerHTML = xhr.responseText;
           // var response = JSON.parse(xhr.responseText);
            //console.log(xhr.responseText);
        /*    if(response.error != null){
            }else{
                console.log(response);
                
            }*/
        }
    }
}