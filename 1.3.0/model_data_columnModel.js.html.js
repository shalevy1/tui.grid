tui.util.defineNamespace("fedoc.content", {});
fedoc.content["model_data_columnModel.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview 컬럼 모델\n * @author NHN Ent. FE Development Team\n */\n'use strict';\n\nvar Model = require('../../base/model');\nvar util = require('../../common/util');\n\n/**\n * 컬럼 모델 데이터를 다루는 객체\n * @module model/data/columnModel\n * @extends module:base/model\n */\nvar ColumnModel = Model.extend(/**@lends module:model/data/columnModel.prototype */{\n    /**\n     * @constructs\n     */\n    initialize: function() {\n        Model.prototype.initialize.apply(this, arguments);\n        this.textType = {\n            'normal': true,\n            'text': true,\n            'password': true\n        };\n        this._setColumnModelList(this.get('columnModelList'));\n        this.on('change', this._onChange, this);\n    },\n\n    defaults: {\n        keyColumnName: null,\n        columnFixCount: 0,\n        metaColumnModelList: [],\n        dataColumnModelList: [],\n        visibleList: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장\n        hasNumberColumn: true,\n        selectType: '',\n        columnModelMap: {},\n        relationListMap: {},\n        columnMerge: []\n    },\n\n    /**\n     * 메타컬럼모델들을 초기화한다.\n     * @param {Array} source - 사용자가 입력한 메타컬럼의 셋팅값\n     * @returns {Array} dset - 초기화가 완료된 메타컬럼 모델 리스트\n     * @private\n     */\n    _initializeMetaColumns: function(source) {\n        var dest = [];\n\n        this._initializeButtonColumn(dest);\n        this._initializeNumberColumn(dest);\n        this._overwriteColumnModelList(dest, source);\n        return dest;\n    },\n\n    /**\n     * overwrite column model list\n     * @param {Array} dest - destination model list\n     * @param {Array} source - source model list\n     * @private\n     */\n    _overwriteColumnModelList: function(dest, source) {\n        _.each(source, function(columnModel) {\n            this._extendColumnList(columnModel, dest);\n        }, this);\n    },\n\n    /**\n     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 number column 을 추가한다.\n     * @param {Array} metaColumnModelList - Meta column model list\n     * @private\n     */\n    _initializeNumberColumn: function(metaColumnModelList) {\n        var hasNumberColumn = this.get('hasNumberColumn'),\n            numberColumn = {\n                columnName: '_number',\n                align: 'center',\n                title: 'No.',\n                isFixedWidth: true,\n                width: 60\n            };\n        if (!hasNumberColumn) {\n            numberColumn.isHidden = true;\n        }\n\n        this._extendColumnList(numberColumn, metaColumnModelList);\n    },\n\n    /**\n     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 button column 을 추가한다.\n     * @param {Array} metaColumnModelList - Meta column model listt\n     * @private\n     */\n    _initializeButtonColumn: function(metaColumnModelList) {\n        var selectType = this.get('selectType'),\n            buttonColumn = {\n                columnName: '_button',\n                isHidden: false,\n                align: 'center',\n                editOption: {\n                    type: 'mainButton'\n                },\n                isFixedWidth: true,\n                width: 40\n            };\n\n        if (selectType === 'checkbox') {\n            buttonColumn.title = '&lt;input type=\"checkbox\"/>';\n        } else if (selectType === 'radio') {\n            buttonColumn.title = '선택';\n        } else {\n            buttonColumn.isHidden = true;\n        }\n\n        this._extendColumnList(buttonColumn, metaColumnModelList);\n    },\n\n    /**\n     * column을 추가(push)한다.\n     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.\n     * @param {object} columnObj 추가할 컬럼모델\n     * @param {Array} columnModelList 컬럼모델 배열\n     * @private\n     */\n    _extendColumnList: function(columnObj, columnModelList) {\n        var columnName = columnObj.columnName,\n            index = _.findIndex(columnModelList, {columnName: columnName});\n\n        if (index === -1) {\n            columnModelList.push(columnObj);\n        } else {\n            columnModelList[index] = $.extend(columnModelList[index], columnObj);\n        }\n    },\n\n    /**\n     * index 에 해당하는 columnModel 을 반환한다.\n     * @param {Number} index    조회할 컬럼모델의 인덱스 값\n     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.\n     * @returns {object} 조회한 컬럼 모델\n     */\n    at: function(index, isVisible) {\n        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('dataColumnModelList');\n        return columnModelList[index];\n    },\n\n    /**\n     * columnName 에 해당하는 index를 반환한다.\n     * @param {string} columnName   컬럼명\n     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.\n     * @returns {number} index   컬럼명에 해당하는 인덱스 값\n     */\n    indexOfColumnName: function(columnName, isVisible) {\n        var columnModelList;\n\n        if (isVisible) {\n            columnModelList = this.getVisibleColumnModelList();\n        } else {\n            columnModelList = this.get('dataColumnModelList');\n        }\n        return _.findIndex(columnModelList, {columnName: columnName});\n    },\n\n    /**\n     * columnName 이 열고정 영역에 있는 column 인지 반환한다.\n     * @param {String} columnName   컬럼명\n     * @returns {Boolean} 열고정 영역에 존재하는 컬럼인지 여부\n     */\n    isLside: function(columnName) {\n        var index = this.indexOfColumnName(columnName, true);\n\n        return (index > -1) &amp;&amp; (index &lt; this.get('columnFixCount'));\n    },\n\n    /**\n     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.\n     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.\n     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.\n     * @returns {Array}  조회한 컬럼모델 배열\n     */\n    getVisibleColumnModelList: function(whichSide, withMeta) {\n        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount(),\n            visibleColumnFixCount = this.getVisibleColumnFixCount(withMeta),\n            columnModelList;\n\n        whichSide = whichSide &amp;&amp; whichSide.toUpperCase();\n\n        if (whichSide === 'L') {\n            columnModelList = this.get('visibleList').slice(startIndex, visibleColumnFixCount);\n        } else if (whichSide === 'R') {\n            columnModelList = this.get('visibleList').slice(visibleColumnFixCount);\n        } else {\n            columnModelList = this.get('visibleList').slice(startIndex);\n        }\n\n        return columnModelList;\n    },\n\n    /**\n     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.\n     * @returns {number} count\n     */\n    getVisibleMetaColumnCount: function() {\n        var models = this.get('metaColumnModelList'),\n            totalLength = models.length,\n            hiddenLength = _.where(models, {\n                isHidden: true\n            }).length;\n\n        return (totalLength - hiddenLength);\n    },\n\n    /**\n     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.\n     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부\n     * @returns {number} Visible columnFix count\n     */\n    getVisibleColumnFixCount: function(withMeta) {\n        var count = this.get('columnFixCount'),\n            fixedColumns = _.first(this.get('dataColumnModelList'), count),\n            visibleFixedColumns = _.filter(fixedColumns, function(column) {\n                return !column.isHidden;\n            }),\n            visibleCount = visibleFixedColumns.length;\n\n        if (withMeta) {\n            visibleCount += this.getVisibleMetaColumnCount();\n        }\n        return visibleCount;\n    },\n\n    /**\n     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.\n     * @param {String} columnName   컬럼명\n     * @returns {Object} 컬럼명에 해당하는 컬럼모델\n     */\n    getColumnModel: function(columnName) {\n        return this.get('columnModelMap')[columnName];\n    },\n\n    /**\n     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.\n     * 랜더링시 html 태그 문자열을 제거할때 사용됨.\n     * @param {String} columnName 컬럼명\n     * @returns {boolean} text 타입인지 여부\n     */\n    isTextType: function(columnName) {\n        return !!this.textType[this.getEditType(columnName)];\n    },\n\n    /**\n     * 컬럼 모델로부터 editType 을 반환한다.\n     * @param {string} columnName The name of the target column\n     * @returns {string} 해당하는 columnName 의 editType 을 반환한다.\n     */\n    getEditType: function(columnName) {\n        var columnModel = this.getColumnModel(columnName),\n            editType = 'normal';\n\n        if (columnName === '_button' || columnName === '_number') {\n            editType = columnName;\n        } else if (columnModel &amp;&amp; columnModel.editOption &amp;&amp; columnModel.editOption.type) {\n            editType = columnModel.editOption.type;\n        }\n\n        return editType;\n    },\n\n    /**\n     * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.\n     * @param {Array} metaColumnModelList 메타 컬럼 모델 리스트\n     * @param {Array} dataColumnModelList 데이터 컬럼 모델 리스트\n     * @returns {Array}  isHidden 이 설정되지 않은 전체 컬럼 모델 리스트\n     * @private\n     */\n    _makeVisibleColumnModelList: function(metaColumnModelList, dataColumnModelList) {\n        metaColumnModelList = metaColumnModelList || this.get('metaColumnModelList');\n        dataColumnModelList = dataColumnModelList || this.get('dataColumnModelList');\n\n        return _.filter(metaColumnModelList.concat(dataColumnModelList), function(item) {\n            return !item.isHidden;\n        });\n    },\n\n    /**\n     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.\n     * @param {Array} columnModelList - Column Model List\n     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap\n     * @private\n     */\n    _getRelationListMap: function(columnModelList) {\n        var columnName,\n            relationListMap = {};\n\n        _.each(columnModelList, function(columnModel) {\n            columnName = columnModel.columnName;\n            if (columnModel.relationList) {\n                relationListMap[columnName] = columnModel.relationList;\n            }\n        });\n        return relationListMap;\n    },\n\n    /**\n     * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.\n     * @returns {Array} isIgnore 가 true 로 설정된 columnName 배열.\n     */\n    getIgnoredColumnNameList: function() {\n        var columnModelLsit = this.get('dataColumnModelList'),\n            ignoreColumnNameList = [];\n        _.each(columnModelLsit, function(columnModel) {\n            if (columnModel.isIgnore) {\n                ignoreColumnNameList.push(columnModel.columnName);\n            }\n        });\n        return ignoreColumnNameList;\n    },\n\n    /**\n     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,\n     * 메타컬럼과 데이터컬럼을 분리하여 저장한다.\n     * @param {Array} columnModelList   컬럼모델 배열\n     * @param {number} [columnFixCount]   열고정 카운트\n     * @private\n     */\n    _setColumnModelList: function(columnModelList, columnFixCount) {\n        var division, relationListMap, visibleList, metaColumnModelList, dataColumnModelList;\n\n        columnModelList = $.extend(true, [], columnModelList);\n        if (tui.util.isUndefined(columnFixCount)) {\n            columnFixCount = this.get('columnFixCount');\n        }\n\n        division = _.partition(columnModelList, function(model) {\n            return util.isMetaColumn(model.columnName);\n        }, this);\n        metaColumnModelList = this._initializeMetaColumns(division[0]);\n        dataColumnModelList = division[1];\n\n        relationListMap = this._getRelationListMap(dataColumnModelList);\n        visibleList = this._makeVisibleColumnModelList(metaColumnModelList, dataColumnModelList);\n        this.set({\n            metaColumnModelList: metaColumnModelList,\n            dataColumnModelList: dataColumnModelList,\n            columnModelMap: _.indexBy(metaColumnModelList.concat(dataColumnModelList), 'columnName'),\n            relationListMap: relationListMap,\n            columnFixCount: Math.max(0, columnFixCount),\n            visibleList: visibleList\n        }, {\n            silent: true\n        });\n        this.unset('columnModelList', {\n            silent: true\n        });\n        this.trigger('columnModelChange');\n    },\n\n    /**\n     * change 이벤트 발생시 핸들러\n     * @param {Object} model change 이벤트가 발생한 model 객체\n     * @private\n     */\n    _onChange: function(model) {\n        var changed = model.changed,\n            columnFixCount = changed.columnFixCount,\n            columnModelList = changed.columnModelList;\n\n        if (!columnModelList) {\n            columnModelList = this.get('dataColumnModelList');\n        }\n        this._setColumnModelList(columnModelList, columnFixCount);\n    },\n\n    /**\n     * Set 'isHidden' property of column model to true or false\n     * @param {Array} columnNames - Column names to set 'isHidden' property\n     * @param {boolean} isHidden - Hidden flag for setting\n     */\n    setHidden: function(columnNames, isHidden) {\n        var name, names, columnModel, visibleList;\n\n        while (columnNames.length) {\n            name = columnNames.shift();\n            columnModel = this.getColumnModel(name);\n\n            if (columnModel) {\n                columnModel.isHidden = isHidden;\n            } else {\n                names = this.getUnitColumnNamesIfMerged(name);\n                columnNames.push.apply(columnNames, names);\n            }\n        }\n\n        visibleList = this._makeVisibleColumnModelList(\n            this.get('metaColumnModelList'),\n            this.get('dataColumnModelList')\n        );\n        this.set('visibleList', visibleList, {\n            silent: true\n        });\n        this.trigger('columnModelChange');\n    },\n\n    /**\n     * Get unit column names\n     * @param {string} columnName - columnName\n     * @returns {Array.&lt;string>} Unit column names\n     */\n    getUnitColumnNamesIfMerged: function(columnName) {\n        var columnMergeInfoList = this.get('columnMerge'),\n            stackForSearch = [],\n            searchedNames = [],\n            name, columnModel, columnMergeInfoItem;\n\n        stackForSearch.push(columnName);\n        while (stackForSearch.length) {\n            name = stackForSearch.shift();\n            columnModel = this.getColumnModel(name);\n\n            if (columnModel) {\n                searchedNames.push(name);\n            } else {\n                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {\n                    columnName: name\n                });\n                if (columnMergeInfoItem) {\n                    stackForSearch.push.apply(stackForSearch, columnMergeInfoItem.columnNameList);\n                }\n            }\n        }\n        return _.uniq(searchedNames);\n    }\n});\n\nmodule.exports = ColumnModel;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"