# 읽어주세요

*Waifu Material* (이)는 [hitomi.la](https://hitomi.la) (을)를 위한 **Downloader** / **Viewer** 입니다.<br>

## 1. 전체화면 단축키

<kbd>F11</kbd> (을)를 누르면 전체화면으로 **진입**하며,<br>
<kbd>F11</kbd> (을)를 또다시 누르면 전체화면을 **종료**합니다.<br>
또한 전체화면 **진입**시, **titlebar**, **paging** (이)가 불가시화 합니다.<br>

## 2. 방향키 상호작용

**paging** 을 위한 추가 상호작용으로, **paging** 이 가시적으로 활성화가 돼있다면,<br>
<kbd><</kbd> (이)는 **1** 만큼 차감시키고, <kbd>></kbd> (이)는 **1** 만큼 증가시킵니다.<br>

## 3. 검색어, 접두어, 묶음

추가 검색어 `id:<number>`, `status:<NONE/FINISHED/WORKING/QUEUED/PAUSED/ERROR>`(을)를 지원합니다.<br>
접두어는 `AND`, `INCLUDE`, `EXCLUDE`(와)과 같이 3종류가 있습니다.<br>
접두어는 낮말 혹은 묶음의 앞에 추가해 사용 가능하며, 기본 접두어는 `AND`입니다.<br>

#### AND

**해당 접두어가 붙은 검색어의 결과**와 이전 결과 간의 **공통**된 결과를 연산합니다.<br>
*이전 결과가 없을 경우 `INCLUDE`(와)과 동일한 동작을 합니다*<br>

#### INCLUDE (+)

**해당 접두어가 붙은 검색어의 결과**를 이전 결과에 **추가**합니다.<br>

#### EXCLUDE (-)

**해당 접두어가 붙은 검색어의 결과**를 이전 결과에서 **제거**합니다.<br>

또한 `()`으로 검색어들을 묶을 수 있으며, 묶음은 **중첩**이 가능합니다.<br>
묶음 내부에서 연산된 결과는 접두어에 따라 묶음 밖 결과에 영향을 끼칩니다.<br>
다음은 검색어, 접두어, 묶음의 조합 예시입니다.<br>
```
(language:korean +language:english) type:manga
```
*한국어 혹은 영어로 번역된 만화를 연산합니다.*<br>
```
tag:uncensored -(type:manga -(language:korean))
```
*한국어로 번역된 미검열 (만화가 아닌)갤러리를 연산합니다.*<br>
