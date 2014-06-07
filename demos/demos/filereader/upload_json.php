<?php
    header('Content-Type: application/json');
    $directory = "upload/";
    $a = 0;
    echo "[";
    foreach ($_FILES['pictures']['name'] as $nameFile) {
        if (is_uploaded_file($_FILES['pictures']['tmp_name'][$a])) {
            $success = move_uploaded_file($_FILES['pictures']['tmp_name'][$a], $directory . $_FILES['pictures']['name'][$a]);
            if(!$success){
                $success = 0;
            }
            echo '{"name": "'.$nameFile.'", "src": "'. $directory.$nameFile.'", "success": '.$success.'}';
        }
        $a++;
    }
    echo "]";

?>

