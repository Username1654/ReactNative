import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    TouchableOpacity,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAYER_SIZE = 56;   // draggable square size (px)
const ENEMY_SIZE = 44;   // enemy square size (px)
const SPAWN_PAD = 20;   // min distance from screen edges when spawning
const MAX_LIVES = 3;    // lives before game over
const ROUND_TIME = 10;   // seconds per round
const MAX_TARGET = 110;  // target starts this big (px)
const MIN_TARGET = 36;   // target shrinks to this minimum (px)
const TICK_MS = 16;   // ~60fps game loop interval

// Enemy movement patterns — added one per difficulty level
type EnemyPattern = "horizontal" | "vertical" | "circle" | "figure8";

interface Enemy {
    id: number;
    pattern: EnemyPattern;
    phaseOffset: number; // so multiple enemies are out of sync
    speed: number;       // multiplier on the sin/cos tick
    amplitude: number;   // how far it travels from center
}

// Player shape options — covered in the shapes section of the primer
type ShapeType = "square" | "circle" | "diamond" | "triangle";
const SHAPES: ShapeType[] = ["square", "circle", "diamond", "triangle"];
const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Constrain val between min and max. */
const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);

/** Linear interpolation — lerp(0, 120, 0.5) = 60 */
const lerp = (min: number, max: number, t: number) => min + (max - min) * t;

/** Build enemy list for a given score/round */
const buildEnemies = (score: number): Enemy[] => {
    const count = Math.min(1 + Math.floor(score / 3), 4); // max 4 enemies
    const patterns: EnemyPattern[] = ["horizontal", "vertical", "circle", "figure8"];
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        pattern: patterns[i % patterns.length],
        phaseOffset: (i * Math.PI * 2) / count,
        speed: 1 + score * 0.08,
        amplitude: 0.28 + i * 0.04, // fraction of screen dimension
    }));
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DragGame() {
    // ── Layout ──────────────────────────────────────────────────────────────
    const layoutRef = useRef({ width: 0, height: 0 });

    // ── Game state ──────────────────────────────────────────────────────────
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(MAX_LIVES);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [gameOver, setGameOver] = useState(false);
    const [phase, setPhase] = useState < "playing" | "scored" | "hit" > ("playing");

    // ── Player appearance ───────────────────────────────────────────────────
    const [color, setColor] = useState(COLORS[0]);
    const [shape, setShape] = useState < ShapeType > ("square");

    // ── Enemy list ──────────────────────────────────────────────────────────
    const [enemies, setEnemies] = useState < Enemy[] > (() => buildEnemies(0));

    // ── Animated position of the draggable player ───────────────────────────
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    // ── Enemy positions (updated every tick, stored in refs for perf) ────────
    // One {x, y} state entry per enemy, updated together each frame
    const [enemyPositions, setEnemyPositions] = useState < { x: number; y: number }[] > ([]);

    // ── Ticks ────────────────────────────────────────────────────────────────
    const tickRef = useRef(0);   // game clock (incremented each frame)
    const aliveRef = useRef(true); // false during hit flash / game over

    // ─────────────────────────────────────────────────────────────────────────
    // Spawn the player at a random edge position
    // ─────────────────────────────────────────────────────────────────────────
    const spawnPlayer = useCallback((w: number, h: number) => {
        const minX = SPAWN_PAD;
        const maxX = w - PLAYER_SIZE - SPAWN_PAD;
        const minY = SPAWN_PAD;
        const maxY = h - PLAYER_SIZE - SPAWN_PAD;

        // Pick a random edge to spawn from (0=top 1=right 2=bottom 3=left)
        const side = Math.floor(Math.random() * 4);
        let sx = 0, sy = 0;
        switch (side) {
            case 0: sx = clamp(minX + Math.random() * (maxX - minX), minX, maxX); sy = minY; break;
            case 1: sx = maxX; sy = clamp(minY + Math.random() * (maxY - minY), minY, maxY); break;
            case 2: sx = clamp(minX + Math.random() * (maxX - minX), minX, maxX); sy = maxY; break;
            case 3: sx = minX; sy = clamp(minY + Math.random() * (maxY - minY), minY, maxY); break;
        }

        pan.setValue({ x: sx, y: sy });

        // Pick random color and shape for new round
        setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
    }, [pan]);

    // ─────────────────────────────────────────────────────────────────────────
    // Check player ↔ target collision
    // ─────────────────────────────────────────────────────────────────────────
    const isOverTarget = useCallback(() => {
        const px = (pan.x as any)._offset + (pan.x as any)._value;
        const py = (pan.y as any)._offset + (pan.y as any)._value;

        const { width, height } = layoutRef.current;
        // Target size is derived live from timeLeft — we recalculate here
        const tSize = lerp(MIN_TARGET, MAX_TARGET, timeLeft / ROUND_TIME);
        const tx = width / 2 - tSize / 2;
        const ty = height / 2 - tSize / 2;

        return (
            px < tx + tSize &&
            px + PLAYER_SIZE > tx &&
            py < ty + tSize &&
            py + PLAYER_SIZE > ty
        );
    }, [pan, timeLeft]);

    // ─────────────────────────────────────────────────────────────────────────
    // Check player ↔ any enemy collision (called each game tick)
    // ─────────────────────────────────────────────────────────────────────────
    const checkEnemyCollisions = useCallback(
        (positions: { x: number; y: number }[]) => {
            const px = (pan.x as any)._offset + (pan.x as any)._value;
            const py = (pan.y as any)._offset + (pan.y as any)._value;

            for (const ep of positions) {
                const overlap =
                    px < ep.x + ENEMY_SIZE &&
                    px + PLAYER_SIZE > ep.x &&
                    py < ep.y + ENEMY_SIZE &&
                    py + PLAYER_SIZE > ep.y;

                if (overlap) return true;
            }
            return false;
        },
        [pan]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // PanResponder — handles the drag gesture
    // ─────────────────────────────────────────────────────────────────────────
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => aliveRef.current,

            // On touch-down: save current position as offset, reset delta to zero
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: (pan.x as any)._value,
                    y: (pan.y as any)._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },

            // Each frame: pipe gesture deltas into the animated position
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),

            // On release: flatten offset, check if landed on target
            onPanResponderRelease: () => {
                pan.flattenOffset();
                // Collision check is handled by the scoring useEffect below
            },
        })
    ).current;

    // ─────────────────────────────────────────────────────────────────────────
    // Game loop — enemy movement + collision detection (~60fps)
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameOver) return;

        const loop = setInterval(() => {
            if (!aliveRef.current) return;

            tickRef.current += 0.016; // advance clock by ~1/60 second each frame

            const { width, height } = layoutRef.current;
            if (width === 0) return; // layout not measured yet

            // Calculate new position for every enemy
            const newPositions = enemies.map((e) => {
                const t = tickRef.current * e.speed + e.phaseOffset;
                const cx = width / 2;
                const cy = height / 2;
                const ax = width * e.amplitude;
                const ay = height * e.amplitude;

                // ── Movement patterns ──────────────────────────────────────────
                switch (e.pattern) {
                    case "horizontal":
                        // Back and forth across the screen
                        return { x: cx + Math.sin(t) * ax - ENEMY_SIZE / 2, y: cy * 0.4 };

                    case "vertical":
                        // Up and down on the right side
                        return { x: cx * 1.2, y: cy + Math.sin(t) * ay * 0.7 - ENEMY_SIZE / 2 };

                    case "circle":
                        // Circular orbit around the target
                        return {
                            x: cx + Math.cos(t) * ax * 0.5 - ENEMY_SIZE / 2,
                            y: cy + Math.sin(t) * ay * 0.5 - ENEMY_SIZE / 2,
                        };

                    case "figure8":
                        // Lissajous figure-8
                        return {
                            x: cx + Math.sin(t) * ax * 0.45 - ENEMY_SIZE / 2,
                            y: cy + Math.sin(t * 2) * ay * 0.3 - ENEMY_SIZE / 2,
                        };

                    default:
                        return { x: cx, y: cy };
                }
            });

            setEnemyPositions(newPositions);

            // Check if any enemy is touching the player
            if (checkEnemyCollisions(newPositions)) {
                aliveRef.current = false;
                setPhase("hit");
                setLives((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setGameOver(true);
                    } else {
                        // Brief pause then respawn
                        setTimeout(() => {
                            const { width: w, height: h } = layoutRef.current;
                            spawnPlayer(w, h);
                            aliveRef.current = true;
                            setPhase("playing");
                        }, 800);
                    }
                    return next;
                });
            }
        }, TICK_MS);

        return () => clearInterval(loop);
    }, [enemies, gameOver, checkEnemyCollisions, spawnPlayer]);

    // ─────────────────────────────────────────────────────────────────────────
    // Shot clock — counts down, updates target size via timeLeft state
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameOver || phase !== "playing") return;

        if (timeLeft <= 0) {
            // Time ran out — lose a life
            aliveRef.current = false;
            setPhase("hit");
            setLives((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    setGameOver(true);
                } else {
                    setTimeout(() => {
                        const { width: w, height: h } = layoutRef.current;
                        spawnPlayer(w, h);
                        setTimeLeft(ROUND_TIME);
                        aliveRef.current = true;
                        setPhase("playing");
                    }, 800);
                }
                return next;
            });
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, parseFloat((prev - 0.1).toFixed(1))));
        }, 100);

        return () => clearInterval(timer);
    }, [timeLeft, gameOver, phase, spawnPlayer]);

    // ─────────────────────────────────────────────────────────────────────────
    // Score check — poll the animated position every frame to detect landing
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (gameOver) return;

        // Listen for pan value changes (fires during and after drag)
        const id = pan.addListener(() => {
            if (!aliveRef.current) return;
            if (isOverTarget()) {
                // Scored!
                aliveRef.current = false;
                setPhase("scored");
                setScore((prev) => {
                    const next = prev + 1;
                    setEnemies(buildEnemies(next)); // increase difficulty
                    setTimeout(() => {
                        const { width: w, height: h } = layoutRef.current;
                        spawnPlayer(w, h);
                        setTimeLeft(ROUND_TIME);
                        aliveRef.current = true;
                        setPhase("playing");
                    }, 500);
                    return next;
                });
            }
        });

        return () => pan.removeListener(id);
    }, [gameOver, isOverTarget, spawnPlayer, pan]);

    // ─────────────────────────────────────────────────────────────────────────
    // Restart
    // ─────────────────────────────────────────────────────────────────────────
    const restart = () => {
        tickRef.current = 0;
        aliveRef.current = true;
        setScore(0);
        setLives(MAX_LIVES);
        setTimeLeft(ROUND_TIME);
        setPhase("playing");
        setGameOver(false);
        setEnemies(buildEnemies(0));
        const { width: w, height: h } = layoutRef.current;
        spawnPlayer(w, h);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Derived values
    // ─────────────────────────────────────────────────────────────────────────

    // Target size shrinks as time runs out (lerp)
    const targetSize = lerp(MIN_TARGET, MAX_TARGET, timeLeft / ROUND_TIME);

    // Timer bar color: green → yellow → red
    const timerColor = timeLeft > 6 ? "#2ecc71" : timeLeft > 3 ? "#f39c12" : "#e74c3c";

    // Flash tint during hit
    const hitOverlay = phase === "hit" ? "rgba(231,76,60,0.35)" : "transparent";

    // ─────────────────────────────────────────────────────────────────────────
    // Shape style helper — returns extra style for the player shape
    // ─────────────────────────────────────────────────────────────────────────
    const getShapeStyle = (): object => {
        switch (shape) {
            case "circle":
                return { borderRadius: PLAYER_SIZE / 2 };
            case "diamond":
                return {}; // rotation added inline in transform array
            case "triangle":
                return styles.triangle;
            default:
                return {};
        }
    };

    // Triangle shape uses zero width/height + border trick, so skip backgroundColor
    const isTriangle = shape === "triangle";

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.root}>
            {/* ── HUD ─────────────────────────────────────────────────────── */}
            <View style={styles.hud}>
                <View style={styles.hudLeft}>
                    <Text style={styles.hudLabel}>SCORE</Text>
                    <Text style={styles.hudValue}>{score}</Text>
                </View>

                <View style={styles.hudCenter}>
                    <Text style={styles.hudLabel}>TIME</Text>
                    <Text style={[styles.hudValue, { color: timerColor }]}>
                        {timeLeft.toFixed(1)}
                    </Text>
                </View>

                <View style={styles.hudRight}>
                    <Text style={styles.hudLabel}>LIVES</Text>
                    <Text style={styles.hudValue}>
                        {Array.from({ length: MAX_LIVES }, (_, i) =>
                            i < lives ? "♥ " : "♡ "
                        )}
                    </Text>
                </View>
            </View>

            {/* Timer bar */}
            <View style={styles.timerTrack}>
                <View
                    style={[
                        styles.timerFill,
                        { width: `${(timeLeft / ROUND_TIME) * 100}%`, backgroundColor: timerColor },
                    ]}
                />
            </View>

            {/* ── Play area ───────────────────────────────────────────────── */}
            <View
                style={[styles.arena, { backgroundColor: hitOverlay }]}
                onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    layoutRef.current = { width, height };
                    // First layout — spawn player
                    if (width > 0 && height > 0 && !gameOver) {
                        spawnPlayer(width, height);
                    }
                }}
            >
                {/* ── Target zone ─────────────────────────────────────────── */}
                <View
                    style={[
                        styles.target,
                        {
                            width: targetSize,
                            height: targetSize,
                            marginLeft: -targetSize / 2,
                            marginTop: -targetSize / 2,
                            // Pulse color when time is almost up
                            borderColor: timeLeft < 3 ? "#e74c3c" : "#4ecdc4",
                            opacity: phase === "scored" ? 0.3 : 1,
                        },
                    ]}
                >
                    <Text style={styles.targetLabel}>DROP</Text>
                </View>

                {/* ── Enemies ─────────────────────────────────────────────── */}
                {enemies.map((enemy, i) => {
                    const pos = enemyPositions[i] ?? { x: -999, y: -999 };
                    return (
                        <View
                            key={enemy.id}
                            style={[
                                styles.enemy,
                                {
                                    left: pos.x,
                                    top: pos.y,
                                    // Different tint per pattern so students can tell them apart
                                    backgroundColor:
                                        enemy.pattern === "horizontal" ? "#e74c3c" :
                                            enemy.pattern === "vertical" ? "#e67e22" :
                                                enemy.pattern === "circle" ? "#9b59b6" :
                                                    "#e91e63",
                                },
                            ]}
                        >
                            {/* Label shows the movement pattern name — educational */}
                            <Text style={styles.enemyLabel}>{enemy.pattern[0].toUpperCase()}</Text>
                        </View>
                    );
                })}

                {/* ── Draggable player ────────────────────────────────────── */}
                <Animated.View
                    style={[
                        styles.player,
                        getShapeStyle(),
                        {
                            // For non-triangle shapes: use backgroundColor
                            backgroundColor: isTriangle ? "transparent" : color,
                            // Diamond adds a 45deg rotation on top of the translation
                            transform: [
                                { translateX: pan.x },
                                { translateY: pan.y },
                                ...(shape === "diamond" ? [{ rotate: "45deg" }] : []),
                            ],
                            // Triangle border color = player color
                            ...(isTriangle ? { borderBottomColor: color } : {}),
                            opacity: phase === "hit" ? 0.4 : 1,
                        },
                    ]}
                    {...panResponder.panHandlers}
                />

                {/* ── Phase flash labels ───────────────────────────────────── */}
                {phase === "scored" && (
                    <View style={styles.flashLabel}>
                        <Text style={styles.flashTextGood}>+1</Text>
                    </View>
                )}
                {phase === "hit" && (
                    <View style={styles.flashLabel}>
                        <Text style={styles.flashTextBad}>OUCH</Text>
                    </View>
                )}

                {/* ── Instructions (first round only) ─────────────────────── */}
                {score === 0 && phase === "playing" && (
                    <Text style={styles.instructions}>
                        Drag the shape onto the target zone before time runs out.{"\n"}
                        Avoid the moving enemies!
                    </Text>
                )}
            </View>

            {/* ── Game over overlay ────────────────────────────────────────── */}
            {gameOver && (
                <View style={styles.overlay}>
                    <Text style={styles.gameOverTitle}>GAME OVER</Text>
                    <Text style={styles.gameOverScore}>Score: {score}</Text>
                    <TouchableOpacity style={styles.restartBtn} onPress={restart}>
                        <Text style={styles.restartText}>PLAY AGAIN</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0d0f1a",
    },

    // ── HUD
    hud: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#161825",
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d3a",
    },
    hudLeft: { flex: 1, alignItems: "flex-start" },
    hudCenter: { flex: 1, alignItems: "center" },
    hudRight: { flex: 1, alignItems: "flex-end" },
    hudLabel: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 10,
        letterSpacing: 2,
        color: "#555870",
        textTransform: "uppercase",
    },
    hudValue: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 22,
        fontWeight: "700",
        color: "#e8e9f0",
        marginTop: 2,
    },

    // ── Timer bar
    timerTrack: {
        height: 4,
        backgroundColor: "#1e2029",
        width: "100%",
    },
    timerFill: {
        height: 4,
        borderRadius: 2,
    },

    // ── Arena
    arena: {
        flex: 1,
        position: "relative",
    },

    // ── Target zone
    target: {
        position: "absolute",
        left: "50%",
        top: "50%",
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(78,205,196,0.05)",
    },
    targetLabel: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 9,
        letterSpacing: 3,
        color: "#4ecdc4",
        opacity: 0.6,
    },

    // ── Player
    player: {
        position: "absolute",
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        zIndex: 20,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },

    // Triangle shape — zero size + border trick
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: PLAYER_SIZE / 2,
        borderRightWidth: PLAYER_SIZE / 2,
        borderBottomWidth: PLAYER_SIZE * 0.9,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        // borderBottomColor is set inline using the current color
    },

    // ── Enemies
    enemy: {
        position: "absolute",
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        opacity: 0.9,
    },
    enemyLabel: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.7)",
    },

    // ── Flash labels
    flashLabel: {
        position: "absolute",
        top: "40%",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 30,
        pointerEvents: "none",
    },
    flashTextGood: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 64,
        fontWeight: "900",
        color: "#2ecc71",
        opacity: 0.9,
    },
    flashTextBad: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 48,
        fontWeight: "900",
        color: "#e74c3c",
        opacity: 0.9,
    },

    // ── Instructions
    instructions: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        textAlign: "center",
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 13,
        color: "#555870",
        lineHeight: 20,
        pointerEvents: "none",
    },

    // ── Game over overlay
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(13,15,26,0.92)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
    },
    gameOverTitle: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 42,
        fontWeight: "900",
        color: "#e74c3c",
        letterSpacing: 6,
    },
    gameOverScore: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 22,
        color: "#9295a8",
        marginTop: 12,
        marginBottom: 40,
    },
    restartBtn: {
        backgroundColor: "#4ecdc4",
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 8,
    },
    restartText: {
        fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
        fontSize: 16,
        fontWeight: "700",
        color: "#0d0f1a",
        letterSpacing: 3,
    },
});