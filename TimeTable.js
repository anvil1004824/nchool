import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const TimeTable = ({ list }) => {
  const day = ["월", "화", "수", "목", "금"];
  const gyo = [1, 2, 3, 4, 5, 6, 7];
  const returnTable = (list, sIndex) => {
    let sList = [];
    try {
      sList = Object.values(list)[sIndex];
      return sList.map((item, index) => (
        <View style={styles.box} key={index}>
          <Text style={{ fontSize: 10 }}>{item}</Text>
        </View>
      ));
    } catch {
      return null;
    }
  };
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={styles.list}>
        <View style={[styles.box, { backgroundColor: "gray" }]}></View>
        {gyo.map((item) => (
          <View key={item} style={[styles.box]}>
            <Text style={{ fontSize: 20 }}>{item}교시</Text>
          </View>
        ))}
      </View>
      {day.map((sItem, sIndex) => (
        <View key={sIndex} style={styles.box}>
          <View style={styles.box}>
            <Text style={{ fontSize: 40 }}>{sItem}</Text>
          </View>
          {list && returnTable(list, sIndex)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    borderWidth: 0.5,
  },
  list: {
    flex: 1,
  },
});
