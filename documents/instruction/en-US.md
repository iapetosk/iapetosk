# READ ME

*Waifu Material* is *Downloader / Reader*  for [hitomi.la](https://hitomi.la).<br>

## 1. Fullscreen **Shortcut**

Press <kbd>F11</kbd> will **enter** fullscreen.<br>
Press <kbd>F11</kbd> again will **leave** fullscreen.<br>
Also, upon **enter**ing fullscreen, both **titlebar**, and **paging** will become invisible.<br>

## 2. Arrow-key **Interactions**

It is an extra interaction for **paging**.<br>
Press <kbd><</kbd> will increase, and <kbd>></kbd> will decrease **paging** index by **1**.<br>

## 3. Search Terms, Prefixes, and Grouping

App offers special search terms `id:<number>`, and `status:<`[TaskStatus](../../source/modules/download.ts)`>`.<br>
As for prefixes, there are `AND`, `INCLUDE`, and `EXCLUDE`.<br>
Prefix can be used simply by insert it at the start of either search term or a group, and is default of `AND`.<br>

#### **AND**

It computes the **common ground** with the one this prefix is appended and from the previous result.<br>
*If no previous result has found, it works as same as `INCLUDE`.*

#### **INCLUDE** (+)

It **adds** the result of a search term this prefix is appended from previous result.<br>

#### **EXCLUDE** (-)

It **removes** the result of a search term this prefix is appended from previous result.<br>

Also, it's possible to grouping search terms by putting inside `()`, and group can stacks.<br>
Computed result within a group affect outer result depends on group's prefix.<br>
Followings are example of search terms, prefixes, and grouping.<br>
```
(language:korean +language:english) type:manga
```
*computes manga translated into either Korean or English.*<br>
```
tag:uncensored -(type:manga -(language:korean))
```
*computes uncensored galleries translated into Korean.*<br>
