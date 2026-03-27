(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/auth/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function AuthPage() {
    _s();
    const [showToast, setShowToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toastMessage, setToastMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const displayToast = (msg)=>{
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(()=>setShowToast(false), 2800);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                style: {
                    height: '58px',
                    background: 'var(--panel)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 28px',
                    gap: '16px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                            color: 'var(--text)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '32px',
                                    height: '32px',
                                    background: 'linear-gradient(135deg,var(--teal),#0070ff)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#fff'
                                },
                                children: "B•G"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 21,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: 'var(--font-head)',
                                    fontSize: '14px',
                                    fontWeight: 800
                                },
                                children: [
                                    "BG-AI ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'var(--teal)'
                                        },
                                        children: "|"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 22,
                                        columnNumber: 100
                                    }, this),
                                    " NG"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 22,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auth/page.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/auth/page.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            color: 'var(--muted)',
                            fontSize: '13px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            transition: 'all .15s',
                            cursor: 'pointer'
                        },
                        children: "← Kembali ke Chat"
                    }, void 0, false, {
                        fileName: "[project]/src/app/auth/page.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auth/page.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flex: 1
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                        style: {
                            width: '240px',
                            minWidth: '240px',
                            background: 'var(--panel)',
                            borderRight: '1px solid var(--border)',
                            padding: '28px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--muted)',
                                    letterSpacing: '1.5px',
                                    textTransform: 'uppercase',
                                    padding: '14px 10px 6px'
                                },
                                children: "Akun"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            [
                                'Profil Saya',
                                'Keamanan',
                                'Notifikasi'
                            ].map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        color: idx === 0 ? 'var(--teal)' : 'var(--muted)',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'all .15s',
                                        ...idx === 0 ? {
                                            background: 'rgba(0,212,200,.1)',
                                            borderLeft: '2px solid var(--teal)',
                                            paddingLeft: '10px'
                                        } : {}
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '15px',
                                                width: '20px',
                                                textAlign: 'center'
                                            },
                                            children: [
                                                item === 'Profil Saya' && '👤',
                                                item === 'Keamanan' && '🔒',
                                                item === 'Notifikasi' && '🔔'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/auth/page.tsx",
                                            lineNumber: 37,
                                            columnNumber: 15
                                        }, this),
                                        item
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/auth/page.tsx",
                                    lineNumber: 36,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--muted)',
                                    letterSpacing: '1.5px',
                                    textTransform: 'uppercase',
                                    padding: '14px 10px 6px'
                                },
                                children: "Platform"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            [
                                'Model AI',
                                'Penggunaan & Kuota',
                                'API Key',
                                'Tim & Anggota'
                            ].map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        color: 'var(--muted)',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'all .15s'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '15px',
                                                width: '20px',
                                                textAlign: 'center'
                                            },
                                            children: [
                                                item === 'Model AI' && '⬡',
                                                item === 'Penggunaan & Kuota' && '📊',
                                                item === 'API Key' && '🔑',
                                                item === 'Tim & Anggota' && '👥'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/auth/page.tsx",
                                            lineNumber: 49,
                                            columnNumber: 15
                                        }, this),
                                        item
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/src/app/auth/page.tsx",
                                    lineNumber: 48,
                                    columnNumber: 13
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    color: 'var(--muted)',
                                    letterSpacing: '1.5px',
                                    textTransform: 'uppercase',
                                    padding: '14px 10px 6px'
                                },
                                children: "Lainnya"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/terms",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    color: 'var(--muted)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    transition: 'all .15s'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '15px',
                                            width: '20px',
                                            textAlign: 'center'
                                        },
                                        children: "⚖"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 61,
                                        columnNumber: 13
                                    }, this),
                                    "Ketentuan Layanan"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 60,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                onClick: ()=>{
                                    if (confirm('Keluar dari SATU-AI?')) window.location.href = '/login';
                                },
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    color: 'var(--red)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    transition: 'all .15s'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '15px',
                                            width: '20px',
                                            textAlign: 'center'
                                        },
                                        children: "⏏"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 65,
                                        columnNumber: 13
                                    }, this),
                                    "Keluar"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auth/page.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            padding: '36px 40px',
                            overflowY: 'auto',
                            maxWidth: '900px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontFamily: 'var(--font-head)',
                                    fontSize: '22px',
                                    fontWeight: 800,
                                    marginBottom: '6px'
                                },
                                children: "Pengaturan Akun"
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 72,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: 'var(--muted)',
                                    fontSize: '14px',
                                    marginBottom: '32px'
                                },
                                children: "Kelola profil, keamanan, dan preferensi platform Anda."
                            }, void 0, false, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--panel)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    marginBottom: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#1a4a7a,#003355)',
                                            border: '3px solid var(--teal-dim)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '26px',
                                            fontWeight: 800,
                                            fontFamily: 'var(--font-mono)',
                                            color: 'var(--teal)',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        },
                                        children: [
                                            "RP",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    content: "'✎'",
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: '22px',
                                                    height: '22px',
                                                    borderRadius: '50%',
                                                    background: 'var(--teal)',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                },
                                                children: "✎"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 79,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 77,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontFamily: 'var(--font-head)',
                                                    fontSize: '18px',
                                                    fontWeight: 800,
                                                    marginBottom: '3px'
                                                },
                                                children: "Riefky Pratama"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 82,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    color: 'var(--muted)',
                                                    fontSize: '13px',
                                                    marginBottom: '10px'
                                                },
                                                children: "email@example.com · Universitas Teknologi Nusantara"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '8px',
                                                    flexWrap: 'wrap'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            padding: '4px 12px',
                                                            borderRadius: '99px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            background: 'rgba(0,212,200,.12)',
                                                            border: '1px solid rgba(0,212,200,.3)',
                                                            color: 'var(--teal)'
                                                        },
                                                        children: "✦ Admin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 85,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            padding: '4px 12px',
                                                            borderRadius: '99px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            background: 'rgba(0,212,200,.12)',
                                                            border: '1px solid rgba(0,212,200,.3)',
                                                            color: 'var(--teal)'
                                                        },
                                                        children: "🥦 NutriGuard"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 86,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            padding: '4px 12px',
                                                            borderRadius: '99px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            background: 'rgba(245,200,66,.12)',
                                                            border: '1px solid rgba(245,200,66,.3)',
                                                            color: 'var(--gold)'
                                                        },
                                                        children: "🏆 LLMGuardians"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 87,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 84,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'var(--panel)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    marginBottom: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '11px',
                                            color: 'var(--muted)',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            marginBottom: '20px',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: "👤 Informasi Pribadi"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 94,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '16px',
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--muted)',
                                                            marginBottom: '6px',
                                                            letterSpacing: '.5px',
                                                            textTransform: 'uppercase',
                                                            fontFamily: 'var(--font-mono)'
                                                        },
                                                        children: "Nama Depan"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 98,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        defaultValue: "Riefky",
                                                        style: {
                                                            width: '100%',
                                                            background: 'var(--card)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '10px',
                                                            padding: '11px 14px',
                                                            color: 'var(--text)',
                                                            fontFamily: 'var(--font-body)',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 99,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 97,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--muted)',
                                                            marginBottom: '6px',
                                                            letterSpacing: '.5px',
                                                            textTransform: 'uppercase',
                                                            fontFamily: 'var(--font-mono)'
                                                        },
                                                        children: "Nama Belakang"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 102,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        defaultValue: "Pratama",
                                                        style: {
                                                            width: '100%',
                                                            background: 'var(--card)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '10px',
                                                            padding: '11px 14px',
                                                            color: 'var(--text)',
                                                            fontFamily: 'var(--font-body)',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 103,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 101,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 96,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '16px',
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--muted)',
                                                            marginBottom: '6px',
                                                            letterSpacing: '.5px',
                                                            textTransform: 'uppercase',
                                                            fontFamily: 'var(--font-mono)'
                                                        },
                                                        children: "Email"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 109,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "email",
                                                        defaultValue: "email@example.com",
                                                        style: {
                                                            width: '100%',
                                                            background: 'var(--card)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '10px',
                                                            padding: '11px 14px',
                                                            color: 'var(--text)',
                                                            fontFamily: 'var(--font-body)',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 108,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            color: 'var(--muted)',
                                                            marginBottom: '6px',
                                                            letterSpacing: '.5px',
                                                            textTransform: 'uppercase',
                                                            fontFamily: 'var(--font-mono)'
                                                        },
                                                        children: "No. HP / WA"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 113,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        defaultValue: "0812-3456-7890",
                                                        style: {
                                                            width: '100%',
                                                            background: 'var(--card)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '10px',
                                                            padding: '11px 14px',
                                                            color: 'var(--text)',
                                                            fontFamily: 'var(--font-body)',
                                                            fontSize: '14px',
                                                            outline: 'none'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 114,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)',
                                                    marginBottom: '6px',
                                                    letterSpacing: '.5px',
                                                    textTransform: 'uppercase',
                                                    fontFamily: 'var(--font-mono)'
                                                },
                                                children: "Institusi / Instansi"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 119,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                defaultValue: "Universitas Teknologi Nusantara",
                                                style: {
                                                    width: '100%',
                                                    background: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '10px',
                                                    padding: '11px 14px',
                                                    color: 'var(--text)',
                                                    fontFamily: 'var(--font-body)',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 120,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 118,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginBottom: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)',
                                                    marginBottom: '6px',
                                                    letterSpacing: '.5px',
                                                    textTransform: 'uppercase',
                                                    fontFamily: 'var(--font-mono)'
                                                },
                                                children: "Peran / Jabatan"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 124,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                style: {
                                                    width: '100%',
                                                    background: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '10px',
                                                    padding: '11px 14px',
                                                    color: 'var(--text)',
                                                    fontFamily: 'var(--font-body)',
                                                    fontSize: '14px',
                                                    outline: 'none'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Admin Sistem & AI Engineer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 126,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Petugas Pengawas Vendor MBG"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 127,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        children: "Ahli Gizi / Tenaga Kesehatan"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/auth/page.tsx",
                                                        lineNumber: 128,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 125,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '10px',
                                            marginTop: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>displayToast('Perubahan berhasil disimpan ✓'),
                                                style: {
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all .2s',
                                                    fontFamily: 'var(--font-body)',
                                                    border: 'none',
                                                    background: 'linear-gradient(135deg,var(--teal),#0080cc)',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 16px rgba(0,212,200,.2)'
                                                },
                                                children: "Simpan Perubahan"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                style: {
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all .2s',
                                                    fontFamily: 'var(--font-body)',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--card)',
                                                    color: 'var(--text)'
                                                },
                                                children: "Batalkan"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 134,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 93,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: 'rgba(255,77,109,.05)',
                                    border: '1px solid rgba(255,77,109,.2)',
                                    borderRadius: '16px',
                                    padding: '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '11px',
                                            color: 'var(--red)',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase',
                                            marginBottom: '16px'
                                        },
                                        children: "⚠ Zona Berbahaya"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '14px',
                                            color: 'var(--muted)',
                                            marginBottom: '16px'
                                        },
                                        children: "Tindakan berikut bersifat permanen dan tidak dapat dibatalkan."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            gap: '12px',
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>alert('Konfirmasi penghapusan data akan dikirim ke email Anda.'),
                                                style: {
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all .2s',
                                                    fontFamily: 'var(--font-body)',
                                                    border: '1px solid rgba(255,77,109,.3)',
                                                    background: 'rgba(255,77,109,.1)',
                                                    color: 'var(--red)'
                                                },
                                                children: "🗑 Hapus Semua Data Chat"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 143,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>{
                                                    if (confirm('Yakin ingin menghapus akun?')) window.location.href = '/login';
                                                },
                                                style: {
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all .2s',
                                                    fontFamily: 'var(--font-body)',
                                                    border: '1px solid rgba(255,77,109,.3)',
                                                    background: 'rgba(255,77,109,.1)',
                                                    color: 'var(--red)'
                                                },
                                                children: "✕ Hapus Akun Saya"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/auth/page.tsx",
                                                lineNumber: 144,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/auth/page.tsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/auth/page.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/auth/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/auth/page.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            showToast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    bottom: '28px',
                    right: '28px',
                    background: 'var(--card)',
                    border: '1px solid var(--teal-dim)',
                    color: 'var(--teal)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    display: 'block',
                    animation: 'fadeUp .3s ease',
                    boxShadow: 'var(--glow)',
                    zIndex: 999
                },
                children: toastMessage
            }, void 0, false, {
                fileName: "[project]/src/app/auth/page.tsx",
                lineNumber: 152,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/app/auth/page.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/auth/page.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(AuthPage, "/tMjKNfDUmZPF00hl7YkorGhd6I=");
_c = AuthPage;
var _c;
__turbopack_context__.k.register(_c, "AuthPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_auth_page_tsx_0u5pvex._.js.map