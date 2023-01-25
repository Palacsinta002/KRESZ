<?php
/**
* This script fetches all test data from the servers and saves them locally.
*/

function status($message)
{
    echo $message, "\n";
    flush();
}

// Create directiories in case they don't exist yet
@mkdir('data/asset', 0755, true);
@mkdir('data/category', 0755, true);
@mkdir('data/exercise', 0755, true);

$categories = json_decode(file_get_contents('data/categories.json'), true);

// Loop through each category and download its file
foreach ($categories as $category) {
    $catContent = file_get_contents($category['url']);
    file_put_contents('data/category/' . basename($category['url']), $catContent);

    $catBaseUrl = dirname(dirname($category['url'])); //  . '/'

    $catDoc = DOMDocument::loadXML($catContent, LIBXML_COMPACT | LIBXML_NONET);
    $catXPath = new DOMXpath($catDoc);
    $excercises = 0;
    $assets = 0;
    foreach ($catXPath->query("/Page/exercises/*/id") as $exElement) {
        $excercises++;
        $exId = $exElement->nodeValue;

        // Get excercise file
        $exContent = file_get_contents($catBaseUrl . '/exercise/' . $exId . '.xml');
        file_put_contents('data/exercise/' . $exId . '.xml', $exContent);

        // Get assets for exercise
        $exDoc = DOMDocument::loadXML($exContent, LIBXML_COMPACT | LIBXML_NONET);
        $exXPath = new DOMXpath($exDoc);
        foreach ($exXPath->query("/ExerciseDetails/file/url") as $assetElement) {
            $assets++;
            $assetPath = $assetElement->nodeValue;

            // Get excercise file
            $assetContent = file_get_contents(dirname($catBaseUrl) . '/' . $assetPath);
            file_put_contents('data/asset/' . basename($assetPath), $assetContent);
        }
    }

    status("Finished category '{$category['title']}' ({$category['id']}). It contained {$excercises} excercises and {$assets} assets.");
}

echo $excercises;