// import React, { useState, useRef } from "react";
// import { useEffect } from 'react';
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Text, View, StyleSheet, Animated, PanResponder,Image } from "react-native";

// const SQUARE_SIZE = 60;
// const TARGET_SIZE = 100;
// var randomSize = Math.floor(Math.random()*100)+10
// export default function App() {

//     const [score, setScore] = useState(0);
//     let [seconds, setSeconds] = useState(60);
//     let [failed, setFailed] = useState("false");
//     const [color, setColor] = useState("red");
//     const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//     const layoutRef = useRef({ width: 0, height: 0 });
//     let time = 0
//     setInterval(() => {
//         time++
//         setSeconds(seconds- time)
//         if (time == 60) {
//             setFailed("yeah")
//         }
//     },1000)
//     const spawnSquare = (width: number, height: number) => {
//         const SPAWN_PADDING = 20;

//         const minX = SPAWN_PADDING;
//         const maxX = width - SQUARE_SIZE - SPAWN_PADDING;
//         const minY = SPAWN_PADDING;
//         const maxY = height - SQUARE_SIZE - SPAWN_PADDING;

//         const clamp = (val: number, min: number, max: number) =>
//             Math.min(Math.max(val, min), max);

//         const side = Math.floor(Math.random() * 4);
//         let startX = 0,
//             startY = 0;

//         switch (side) {
//             case 0:
//                 startX = clamp(minX + Math.random() * (maxX - minX), minX, maxX);
//                 startY = minY;
//                 break;
//             case 1:
//                 startX = maxX;
//                 startY = clamp(minY + Math.random() * (maxY - minY), minY, maxY);
//                 break;
//             case 2:
//                 startX = clamp(minX + Math.random() * (maxX - minX), minX, maxX);
//                 startY = maxY;
//                 break;
//             case 3:
//                 startX = minX;
//                 startY = clamp(minY + Math.random() * (maxY - minY), minY, maxY);
//                 break;
//         }

//         const colors = ["red", "blue", "green", "purple", "orange"];
//         setColor(colors[Math.floor(Math.random() * colors.length)]);
//         pan.setValue({ x: startX, y: startY });
//     };

//     const isOverTarget = () => {
//         const squareX = (pan.x as any)._offset + (pan.x as any)._value;
//         const squareY = (pan.y as any)._offset + (pan.y as any)._value;

//         const { width, height } = layoutRef.current;
//         const targetX = width / 2 - TARGET_SIZE / 2;
//         const targetY = height / 2 - TARGET_SIZE / 2;
//         randomSize = Math.floor(Math.random()*100)+10
//         return (
//             squareX < targetX + TARGET_SIZE &&
//             squareX + SQUARE_SIZE > targetX &&
//             squareY < targetY + TARGET_SIZE &&
//             squareY + SQUARE_SIZE > targetY

//         );
//     };
//     const IsOverEnemy = () => {
//         const squareX = (pan.x as any)._offset + (pan.x as any)._value;
//         const squareY = (pan.y as any)._offset + (pan.y as any)._value;

//         const { width, height } = layoutRef.current;
//         const targetX = width / 2 - TARGET_SIZE / 2;
//         const targetY = height / 2 - TARGET_SIZE / 2;

//         return (
//             squareX < targetX + TARGET_SIZE &&
//             squareX + SQUARE_SIZE > targetX &&
//             squareY < targetY + TARGET_SIZE &&
//             squareY + SQUARE_SIZE > targetY
//         );
//     };

//     const panResponder = useRef(
//         PanResponder.create({
//             onStartShouldSetPanResponder: () => true,
//             onPanResponderGrant: () => {
//                 pan.setOffset({
//                     x: (pan.x as any)._value,
//                     y: (pan.y as any)._value,
//                 });
//                 pan.setValue({ x: 0, y: 0 });
//             },
//             onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
//                 useNativeDriver: false,
//             }),
//             onPanResponderRelease: () => {
//                 const scored = isOverTarget();
//                 pan.flattenOffset();
//                 randomSize = Math.floor(Math.random()*100)+10
//                 if (scored) {
//                     setScore((prev) => prev + 1);
//                     const { width, height } = layoutRef.current;
//                     spawnSquare(width, height);
//                     randomSize = Math.floor(Math.random()*100)+10

//                 }
//             },
//         }),
//     ).current;
//     const [enemyPos, setEnemyPos] = useState({ x: 0, y: 100 });
//     const tickRef = useRef(0); // useRef so we don't reset on re-render

//     useEffect(() => {
//       const interval = setInterval(() => {
//         tickRef.current += 0.04;
//         const { width, height } = layoutRef.current;

//         // Pattern 1: horizontal oscillation
//         setEnemyPos({
//           x: width / 2 + Math.cos(tickRef.current) * (width / 3),
//           y: 150,
//         });



//       }, 16); // ~60fps

//       return () => clearInterval(interval); // cleanup!
//     }, []);
//     let you = require('/home/student/TodoApp/assets/YOU.png')
//     let earth = require('/home/student/TodoApp/assets/Earth.png')
//     let moon = require('assets/Moon.png')
//     return (
//         <SafeAreaView style={styles.container}>
//             <View
//                 style={styles.gameContainer}
//                 onLayout={(e) => {
//                     const { width, height } = e.nativeEvent.layout;
//                     layoutRef.current = { width, height };
//                     if (width > 0 && height > 0) {
//                         spawnSquare(width, height);
//                     }
//                 }}
//             >
//                 <Text style={styles.scoreText}>Score: {score}</Text>
//                 <Text >Seconds Left: {seconds}</Text>
//                 <Text >Failed?: {failed}</Text>

//                 <View style={styles.targetSquare}>
//                     <Image
//                         source={earth}
//                         style={{ width:"100%", height:"100%" }}
//                         resizeMode="contain"
//                     />
//                 </View>

//                 <Animated.View
//                     style={[
//                         styles.draggableSquare,
//                         {
//                             backgroundColor: color,
//                             transform: [{ translateX: pan.x }, { translateY: pan.y }],
//                         },
//                     ]}

//                 />
//                 <Animated.View
//   style={{
//     position: 'absolute',
//     width: SQUARE_SIZE,
//     height: SQUARE_SIZE,
//     transform: [{ translateX: pan.x }, { translateY: pan.y }],
//     zIndex: 20,
//   }}
//   {...panResponder.panHandlers}
// >
//   <Image
//     source={you}
//     style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}
//     resizeMode="contain"
//   />
// </Animated.View>
//                 <View
//   style={{
//     position: 'absolute',
//     left: enemyPos.x,
//     top: enemyPos.y,
//     width: 50,
//     height: 50,
//     backgroundColor: 'crimson',
//   }}
// ><Image
//     source={moon}
//     style={{ width:"100%", height:"100%" }}
//     resizeMode="contain"
//   /> </View>
//                 <Text style={styles.instructions}>
//                     Drag the colored square to the gray target
//                 </Text>
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "gray",
//     },
//     gameContainer: {
//         flex: 1,
//         position: "relative",
//     },
//     targetSquare: {
//         position: "absolute",
//         width: randomSize,
//         height: randomSize,
//         backgroundColor: "black",
//         left: "50%",
//         top: "50%",
//         marginLeft: -TARGET_SIZE / 2,
//         marginTop: -TARGET_SIZE / 2,
//     },
//     draggableSquare: {
//         position: "absolute",
//         width: SQUARE_SIZE,
//         height: SQUARE_SIZE,
//         zIndex: 20,
//     },
//     scoreText: {
//         position: "absolute",
//         top: 40,
//         left: 20,
//         fontSize: 24,
//         fontWeight: "bold",
//         zIndex: 10,
//         pointerEvents: "none",
//     },
//     instructions: {
//         position: "absolute",
//         bottom: 40,
//         alignSelf: "center",
//         fontSize: 18,
//         textAlign: "center",
//         paddingHorizontal: 20,
//         zIndex: 10,
//         pointerEvents: "none",
//     },
// });