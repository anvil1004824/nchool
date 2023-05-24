import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const Meal = ({ meal, time }) => {
  let count = [null, null, null];
  meal.forEach(
    (item) => (count[parseInt(item.MMEAL_SC_CODE) - 1] = item.DDISH_NM)
  );
  return (
    <View
      style={{
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 1,
          top: -5,
          left: 0,
          color: "black",
        }}
      >
        <Text>{time}</Text>
      </View>
      <View style={{ flexDirection: "row", flex: 1, marginTop: 15 }}>
        <View style={styles.meal}>
          <Text>조식</Text>
        </View>
        <View style={styles.detail}>
          {count[0] ? (
            count[0].map((item, index) => (
              <View key={index}>
                <Text>{item}</Text>
              </View>
            ))
          ) : (
            <Text>조회된 급식이 없습니다.</Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={styles.meal}>
          <Text>중식</Text>
        </View>
        <View style={styles.detail}>
          {count[1] ? (
            count[1].map((item, index) => (
              <View key={index}>
                <Text>{item}</Text>
              </View>
            ))
          ) : (
            <Text>조회된 급식이 없습니다.</Text>
          )}
        </View>
      </View>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={styles.meal}>
          <Text>석식</Text>
        </View>
        <View style={styles.detail}>
          {count[2] ? (
            count[2].map((item, index) => (
              <View key={index}>
                <Text>{item}</Text>
              </View>
            ))
          ) : (
            <Text>조회된 급식이 없습니다.</Text>
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  meal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
  },
  detail: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
  },
});
