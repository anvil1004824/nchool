import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal } from "./Meal";
import { Picker } from "@react-native-picker/picker";
import { TimeTable } from "./TimeTable";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const KEY = "50386b4a7bdd487184a886275e09698d";
const SCHUL_KEY = "@schul";
const CLASS_KEY = "@class";
const TI_KEY = "@timetable";

export default function App() {
  const [text, setText] = useState("");
  const [schuls, setSchuls] = useState([]);
  const [meal, setMeal] = useState();
  const [loading, setLoading] = useState(true);
  const [tiLoading, setTiLoading] = useState(true);
  const [noSchul, setNoSchul] = useState(false);
  const [schul, setSchul] = useState();
  const [menu, setMenu] = useState(0);
  const [mealMenu, setMealMenu] = useState(0);
  const [grade, setGrade] = useState(0);
  const [gradeClass, setGradeClass] = useState(0);
  const [schulClass, setSchulClass] = useState();
  const [week, setWeek] = useState([]);
  const [timeTable, setTimeTable] = useState();
  const reset = () => {
    setSchul();
    setMenu(0);
    setMealMenu(0);
    setGrade(0);
    setGradeClass(0);
    setSchulClass();
    setTimeTable();
  };
  const onChangeText = (payload) => setText(payload);
  const getSchuls = async (word) => {
    setLoading(true);
    const res = await fetch(
      `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=100&KEY=${KEY}&SCHUL_NM=${word}`
    )
      .then((res) => res.json())
      .catch((e) => e);
    try {
      setSchuls(res.schoolInfo[1].row);
      setNoSchul(false);
    } catch (e) {
      setNoSchul(true);
    }
    setLoading(false);
  };
  const onSubmit = () => {
    if (text === "") return;
    getSchuls(text);
  };
  const saveSchul = async (schul) => {
    await AsyncStorage.setItem(SCHUL_KEY, JSON.stringify(schul));
  };
  const getSchul = async () => {
    const s = await AsyncStorage.getItem(SCHUL_KEY);
    setLoading(false);
    if (s) {
      const json = JSON.parse(s);
      setSchul(json);
      getMeal(json.atpt, json.code);
      getClassInfo(json.atpt, json.code, json.type);
    }
  };
  const listSplit = (list) => {
    list.forEach((item) => {
      const { DDISH_NM } = item;
      item.DDISH_NM = DDISH_NM.split("<br/>");
    });
  };
  const getMealList = async (link) => {
    const res = await fetch(link)
      .then((res) => res.json())
      .catch((e) => e);
    try {
      const {
        mealServiceDietInfo: [, { row }],
      } = res;
      listSplit(row);
      return row;
    } catch (e) {
      return [];
    }
  };
  const padTwo = (str) => String(str).padStart(2, "0");
  const getMeal = async (atpt, code) => {
    setLoading(true);
    const link = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=100&KEY=${KEY}&ATPT_OFCDC_SC_CODE=${atpt}&SD_SCHUL_CODE=${code}`;
    const date = new Date();
    const year = String(date.getFullYear());
    const mon = padTwo(date.getMonth() + 1);
    const day = padTwo(date.getDate());
    const next = new Date(parseInt(year), parseInt(mon), parseInt(day) + 1);
    const nextYear = String(next.getFullYear());
    const nextMonth = padTwo(next.getMonth());
    const nextDay = padTwo(next.getDate());
    const lastDay = String(
      new Date(parseInt(year), parseInt(mon), 0).getDate()
    );
    const today = await getMealList(`${link}&MLSV_YMD=${year + mon + day}`);
    const tomorrow = await getMealList(
      `${link}&MLSV_YMD=${nextYear + nextMonth + nextDay}`
    );
    const month = await getMealList(
      `${link}&MLSV_FROM_YMD=${year + mon + day}&MLSV_TO_YMD=${
        year + mon + lastDay
      }`
    );
    let monlist = {};
    for (let i = year + mon + day; i <= year + mon + lastDay; i++) {
      monlist[i] = [];
    }
    month.forEach((item) => monlist[item.MLSV_YMD].push(item));
    setMeal({
      today,
      todayDate: year + mon + day,
      tomorrow,
      tomoDate: nextYear + nextMonth + nextDay,
      monlist,
    });
    setLoading(false);
  };
  const getThisWeek = () => {
    const currentDay = new Date();
    const theYear = currentDay.getFullYear();
    const theMonth = currentDay.getMonth();
    const theDate = currentDay.getDate();
    let theDayOfWeek = currentDay.getDay();
    theDayOfWeek = theDayOfWeek === 6 ? -1 : theDayOfWeek;
    let thisWeek = [];
    for (let i = 0; i < 5; i++) {
      const resultDay = new Date(
        theYear,
        theMonth,
        theDate + (i - theDayOfWeek + 1)
      );
      const yyyy = resultDay.getFullYear();
      const mm = padTwo(resultDay.getMonth() + 1);
      const dd = padTwo(resultDay.getDate());
      thisWeek.push(`${yyyy}${mm}${dd}`);
    }
    setWeek(thisWeek);
  };
  const getClassInfo = async (atpt, code) => {
    const year = new Date().getFullYear();
    const link = `https://open.neis.go.kr/hub/classInfo?Type=json&pIndex=1&pSize=100&KEY=${KEY}&ATPT_OFCDC_SC_CODE=${atpt}&SD_SCHUL_CODE=${code}&AY=${year}`;
    const res = await fetch(link)
      .then((res) => res.json())
      .catch((e) => e);
    const {
      classInfo: [, { row }],
    } = res;
    let list = [0, 0, 0, 0, 0, 0];
    row.forEach((item) => list[item.GRADE - 1]++);
    setSchulClass(list);
  };
  const getSchulInfo = (info) => {
    setSchul(info);
    saveSchul(info);
    getMeal(info.atpt, info.code);
    getClassInfo(info.atpt, info.code, info.type);
  };
  const extractDate = (date) => {
    const year = date.substr(0, 4);
    const mon = date.substr(4, 2);
    const day = date.substr(6, 2);
    return `${year}년 ${mon}월 ${day}일`;
  };
  const range = (length) => {
    let arr = new Array(length);
    for (let i = 0; i < length; i++) arr[i] = i;
    return arr;
  };
  const saveClass = async (sGrade, sGradeClass) => {
    await AsyncStorage.setItem(
      CLASS_KEY,
      JSON.stringify([sGrade, sGradeClass])
    );
  };
  const getClass = async () => {
    const s = await AsyncStorage.getItem(CLASS_KEY);
    if (s) {
      const [sGrade, sGradeClass] = JSON.parse(s);
      setGrade(sGrade);
      setGradeClass(sGradeClass);
    }
  };
  const makeLenSeven = (list) => {
    if (list.length < 7) {
      list.push(null);
      makeLenSeven(list);
    } else return;
  };
  const saveTimeTable = async (list) => {
    await AsyncStorage.setItem(TI_KEY, JSON.stringify(list));
  };
  const getTimeTable = async () => {
    const s = await AsyncStorage.getItem(TI_KEY);
    if (s) {
      const json = JSON.parse(s);
      setTimeTable(json);
      setTiLoading(false);
    }
  };
  const getTimeTableInfo = async (sSchul, sWeek, sGrade, sGradeClass) => {
    setTiLoading(true);
    let list = {};
    sWeek.forEach((item) => (list[item] = []));
    if (!sGrade || !sGradeClass) {
      setTimeTable();
      setTiLoading(false);
      return;
    }
    const type =
      sSchul.type == "고등학교" ? "hi" : sSchul.type == "중학교" ? "mi" : "el";
    const link = `https://open.neis.go.kr/hub/${type}sTimetable?Type=json&pIndex=1&pSize=100&KEY=${KEY}&ATPT_OFCDC_SC_CODE=${sSchul.atpt}&SD_SCHUL_CODE=${sSchul.code}&GRADE=${sGrade}&CLASS_NM=${sGradeClass}&TI_FROM_YMD=${week[0]}&TI_TO_YMD=${week[4]}`;
    const res = await fetch(link)
      .then((res) => res.json())
      .then((res) => Object.values(res))
      .catch((e) => e);
    const [[, { row }]] = res;
    row.forEach((item) => list[item.ALL_TI_YMD].push(item.ITRT_CNTNT));
    sWeek.forEach((item) => makeLenSeven(list[item]));
    setTimeTable(list);
    saveTimeTable(list);
    setTiLoading(false);
  };
  useEffect(() => {
    getSchul();
    getClass();
    getThisWeek();
    getTimeTable();
  }, []);
  return (
    <View style={styles.container}>
      {!schul ? (
        <View
          style={{
            flex: 1,
            marginTop: 50,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <TextInput
            onSubmitEditing={onSubmit}
            onChangeText={onChangeText}
            returnKeyType="done"
            value={text}
            placeholder="학교를 검색하세요."
            style={{
              padding: 10,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "black",
              width: SCREEN_WIDTH,
            }}
          />
          {loading ? (
            <ActivityIndicator style={{ flex: 1 }} color="black" size="large" />
          ) : noSchul ? (
            <Text>검색된 학교가 없습니다.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ width: SCREEN_WIDTH }}>
              {schuls.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    padding: 10,
                  }}
                >
                  <View
                    style={{
                      flex: 5,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>{item.SCHUL_NM}</Text>
                  </View>
                  <Pressable
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#419CF1",
                      borderRadius: 5,
                      padding: 10,
                    }}
                    onPress={() => {
                      getSchulInfo({
                        atpt: item.ATPT_OFCDC_SC_CODE,
                        code: item.SD_SCHUL_CODE,
                        name: item.SCHUL_NM,
                        engName: item.ENG_SCHUL_NM,
                        type: item.SCHUL_KND_SC_NM,
                        homepage: item.HMPG_ADRES,
                        address: item.ORG_RDNMA,
                        cnstrtype: item.FOND_SC_NM,
                        tel: item.ORG_TELNO,
                        fax: item.ORG_FAXNO,
                        highType: item.HS_SC_NM,
                        fond: item.FOND_YMD,
                        memr: item.FOAS_MEMRD,
                      });
                    }}
                  >
                    <Text style={{ color: "white" }}>학교 선택</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.home}>
          <View style={styles.head}>
            <Pressable style={styles.select} onPress={reset}>
              <Text>학교 선택</Text>
            </Pressable>
            <Pressable
              style={
                menu === 0
                  ? [
                      styles.topBtn,
                      {
                        borderBottomWidth: 0,
                        backgroundColor: "white",
                      },
                    ]
                  : styles.topBtn
              }
              onPress={() => setMenu(0)}
            >
              <Text style={styles.topBtnText}>급식</Text>
            </Pressable>
            <Pressable
              style={
                menu === 1
                  ? [
                      styles.topBtn,
                      {
                        borderBottomWidth: 0,
                        backgroundColor: "white",
                      },
                    ]
                  : styles.topBtn
              }
              onPress={() => setMenu(1)}
            >
              <Text style={styles.topBtnText}>시간표</Text>
            </Pressable>
            <Pressable
              style={
                menu === 2
                  ? [
                      styles.topBtn,
                      {
                        borderBottomWidth: 0,
                        backgroundColor: "white",
                      },
                    ]
                  : styles.topBtn
              }
              onPress={() => setMenu(2)}
            >
              <Text style={styles.topBtnText}>학교 정보</Text>
            </Pressable>
          </View>
          {loading ? (
            <ActivityIndicator style={styles.body} size="large" color="black" />
          ) : menu === 0 ? (
            <View style={styles.body}>
              <View style={styles.mealSelect}>
                <Pressable
                  style={
                    mealMenu === 0
                      ? [
                          styles.mealBtn,
                          {
                            backgroundColor: "gray",
                          },
                        ]
                      : styles.mealBtn
                  }
                  onPress={() => setMealMenu(0)}
                >
                  <Text>오늘</Text>
                </Pressable>
                <Pressable
                  style={
                    mealMenu === 1
                      ? [
                          styles.mealBtn,
                          {
                            backgroundColor: "gray",
                          },
                        ]
                      : styles.mealBtn
                  }
                  onPress={() => setMealMenu(1)}
                >
                  <Text>내일</Text>
                </Pressable>
                <Pressable
                  style={
                    mealMenu === 2
                      ? [
                          styles.mealBtn,
                          {
                            backgroundColor: "gray",
                          },
                        ]
                      : styles.mealBtn
                  }
                  onPress={() => setMealMenu(2)}
                >
                  <Text>월간</Text>
                </Pressable>
              </View>
              <View style={styles.mealPrint}>
                {meal &&
                  (mealMenu === 0 ? (
                    <Meal
                      time={extractDate(meal.todayDate)}
                      meal={meal.today}
                    />
                  ) : mealMenu === 1 ? (
                    <Meal
                      time={extractDate(meal.tomoDate)}
                      meal={meal.tomorrow}
                    />
                  ) : (
                    <ScrollView
                      pagingEnabled
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {Object.keys(meal.monlist).map((item, index) => (
                        <Meal
                          time={extractDate(item)}
                          key={index}
                          meal={meal.monlist[item]}
                        />
                      ))}
                    </ScrollView>
                  ))}
              </View>
            </View>
          ) : menu === 1 ? (
            <View style={styles.body}>
              <Picker
                selectedValue={grade}
                onValueChange={(itemValue) => {
                  setGrade(itemValue);
                  setGradeClass(0);
                  if (schul && week && !itemValue)
                    getTimeTableInfo(schul, week, itemValue, 0);
                }}
              >
                <Picker.Item label="(선택하세요)" value={0} />
                {schulClass &&
                  schulClass.map((item, index) => {
                    if (item)
                      return (
                        <Picker.Item
                          key={index}
                          label={`${index + 1}학년`}
                          value={index + 1}
                        />
                      );
                  })}
              </Picker>
              <Picker
                selectedValue={gradeClass}
                onValueChange={(itemValue) => {
                  setGradeClass(itemValue);
                  if (grade) {
                    if (itemValue) saveClass(grade, itemValue);
                    if (schul && week)
                      getTimeTableInfo(schul, week, grade, itemValue);
                  }
                }}
              >
                <Picker.Item label="(선택하세요)" value={0} />
                {schulClass &&
                  grade !== 0 &&
                  range(schulClass[grade - 1]).map((item) => (
                    <Picker.Item
                      key={item}
                      label={`${item + 1}반`}
                      value={item + 1}
                    />
                  ))}
              </Picker>
              {tiLoading ? (
                <ActivityIndicator
                  style={{ flex: 1 }}
                  color="black"
                  size="large"
                />
              ) : timeTable ? (
                <TimeTable list={timeTable} />
              ) : null}
            </View>
          ) : (
            <View style={[styles.body, { justifyContent: "space-evenly" }]}>
              <Text style={styles.infoText}>이름 : {schul.name}</Text>
              <Text style={styles.infoText}>NAME : {schul.engName}</Text>
              <Text style={styles.infoText}>
                종류 :{" "}
                {schul.cnstrtype +
                  schul.type +
                  (schul.highType ? ` | ${schul.highType}` : "")}
              </Text>
              <Text style={styles.infoText}>
                홈페이지 :
                <Text
                  style={{ color: "blue" }}
                  onPress={() => Linking.openURL(schul.homepage)}
                >
                  {" " + schul.homepage}
                </Text>
              </Text>
              <Text style={styles.infoText}>주소 : {schul.address}</Text>
              <Text style={styles.infoText}>TEL.{schul.tel}</Text>
              <Text style={styles.infoText}>FAX.{schul.fax}</Text>
              <Text style={styles.infoText}>
                설립일 : {extractDate(schul.fond)}
              </Text>
              <Text style={styles.infoText}>
                개교일 : {extractDate(schul.memr)}
              </Text>
            </View>
          )}
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  home: {
    width: "100%",
    height: "100%",
  },
  head: {
    marginTop: 50,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  body: {
    flex: 6,
    position: "relative",
  },
  topBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#419CF1",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  topBtnText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  select: {
    position: "absolute",
    top: -5,
    right: 10,
    backgroundColor: "gray",
    padding: 5,
    borderRadius: 3,
  },
  mealSelect: {
    flex: 1,
    position: "absolute",
    top: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  mealBtn: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  mealBtnText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  mealPrint: {
    flex: 6,
    marginTop: "10%",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 15,
  },
});
