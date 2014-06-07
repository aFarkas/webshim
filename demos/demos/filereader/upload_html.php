<?php
if (isset($_POST['send'])) {
    $directory = "upload/";
    $a = 0;
    foreach ($_FILES['pictures']['name'] as $nameFile) {
        if (is_uploaded_file($_FILES['pictures']['tmp_name'][$a])) {
            move_uploaded_file($_FILES['pictures']['tmp_name'][$a], $directory . $_FILES['pictures']['name'][$a]);
            echo $nameFile  .': <img src="'. $directory.$nameFile.'" /><br />';
        }
        $a++;
    }
}
?>

