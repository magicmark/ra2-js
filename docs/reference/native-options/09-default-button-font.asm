; READ-ONLY STATIC EVIDENCE. Modified supplied base-RA2 executable; not a clean-retail certification.
; Literal VA7cf540, ASCII bytes: 47 41 4d 45 2e 46 4e 54 00 = GAME.FNT\0
; See OPTIONS_NATIVE_REFERENCE.md for limits on default button font vs headings and final rasterization.

; 0x432c90 <= VA < 0x432cbb: GAME.FNT constructor and default font global84e9e8.
  432c90:	6a 44                                           	push   0x44
  432c92:	e8 80 f3 34 00                                  	call   0x782017
  432c97:	83 c4 04                                        	add    esp,0x4
  432c9a:	85 c0                                           	test   eax,eax
  432c9c:	74 12                                           	je     0x432cb0
  432c9e:	68 40 f5 7c 00                                  	push   0x7cf540
  432ca3:	8b c8                                           	mov    ecx,eax
  432ca5:	e8 96 e3 ff ff                                  	call   0x431040
  432caa:	a3 e8 e9 84 00                                  	mov    ds:0x84e9e8,eax
  432caf:	c3                                              	ret
  432cb0:	c7 05 e8 e9 84 00 00 00 00 00                   	mov    DWORD PTR ds:0x84e9e8,0x0
  432cba:	c3                                              	ret

; 0x431040 <= VA < 0x4310fd: Font object constructor passes the filename to loader431150.
  431040:	53                                              	push   ebx
  431041:	55                                              	push   ebp
  431042:	56                                              	push   esi
  431043:	57                                              	push   edi
  431044:	33 ff                                           	xor    edi,edi
  431046:	8b f1                                           	mov    esi,ecx
  431048:	57                                              	push   edi
  431049:	57                                              	push   edi
  43104a:	8d 6e 30                                        	lea    ebp,[esi+0x30]
  43104d:	57                                              	push   edi
  43104e:	bb 01 00 00 00                                  	mov    ebx,0x1
  431053:	57                                              	push   edi
  431054:	55                                              	push   ebp
  431055:	c7 06 88 c7 79 00                               	mov    DWORD PTR [esi],0x79c788
  43105b:	89 7e 04                                        	mov    DWORD PTR [esi+0x4],edi
  43105e:	66 c7 46 24 ff 7f                               	mov    WORD PTR [esi+0x24],0x7fff
  431064:	66 c7 46 26 55 35                               	mov    WORD PTR [esi+0x26],0x3555
  43106a:	c7 46 28 40 00 00 00                            	mov    DWORD PTR [esi+0x28],0x40
  431071:	88 5e 40                                        	mov    BYTE PTR [esi+0x40],bl
  431074:	88 5e 41                                        	mov    BYTE PTR [esi+0x41],bl
  431077:	89 5e 18                                        	mov    DWORD PTR [esi+0x18],ebx
  43107a:	89 5e 1c                                        	mov    DWORD PTR [esi+0x1c],ebx
  43107d:	89 7e 20                                        	mov    DWORD PTR [esi+0x20],edi
  431080:	89 7e 0c                                        	mov    DWORD PTR [esi+0xc],edi
  431083:	89 7e 08                                        	mov    DWORD PTR [esi+0x8],edi
  431086:	ff 15 a8 a4 79 00                               	call   DWORD PTR ds:0x79a4a8 ; USER32.dll!SetRect
  43108c:	8b 4c 24 14                                     	mov    ecx,DWORD PTR [esp+0x14]
  431090:	89 5e 2c                                        	mov    DWORD PTR [esi+0x2c],ebx
  431093:	e8 b8 00 00 00                                  	call   0x431150
  431098:	3b c7                                           	cmp    eax,edi
  43109a:	89 46 04                                        	mov    DWORD PTR [esi+0x4],eax
  43109d:	74 1c                                           	je     0x4310bb
  43109f:	8b 48 04                                        	mov    ecx,DWORD PTR [eax+0x4]
  4310a2:	89 4e 18                                        	mov    DWORD PTR [esi+0x18],ecx
  4310a5:	8b 50 0c                                        	mov    edx,DWORD PTR [eax+0xc]
  4310a8:	8b ce                                           	mov    ecx,esi
  4310aa:	89 56 1c                                        	mov    DWORD PTR [esi+0x1c],edx
  4310ad:	e8 0e 0e 00 00                                  	call   0x431ec0
  4310b2:	8b c6                                           	mov    eax,esi
  4310b4:	5f                                              	pop    edi
  4310b5:	5e                                              	pop    esi
  4310b6:	5d                                              	pop    ebp
  4310b7:	5b                                              	pop    ebx
  4310b8:	c2 04 00                                        	ret    0x4
  4310bb:	57                                              	push   edi
  4310bc:	57                                              	push   edi
  4310bd:	57                                              	push   edi
  4310be:	57                                              	push   edi
  4310bf:	55                                              	push   ebp
  4310c0:	89 7e 04                                        	mov    DWORD PTR [esi+0x4],edi
  4310c3:	66 c7 46 24 ff 7f                               	mov    WORD PTR [esi+0x24],0x7fff
  4310c9:	66 c7 46 26 55 35                               	mov    WORD PTR [esi+0x26],0x3555
  4310cf:	c7 46 28 40 00 00 00                            	mov    DWORD PTR [esi+0x28],0x40
  4310d6:	88 5e 40                                        	mov    BYTE PTR [esi+0x40],bl
  4310d9:	88 5e 41                                        	mov    BYTE PTR [esi+0x41],bl
  4310dc:	89 5e 18                                        	mov    DWORD PTR [esi+0x18],ebx
  4310df:	89 5e 1c                                        	mov    DWORD PTR [esi+0x1c],ebx
  4310e2:	89 7e 20                                        	mov    DWORD PTR [esi+0x20],edi
  4310e5:	89 7e 0c                                        	mov    DWORD PTR [esi+0xc],edi
  4310e8:	89 7e 08                                        	mov    DWORD PTR [esi+0x8],edi
  4310eb:	ff 15 a8 a4 79 00                               	call   DWORD PTR ds:0x79a4a8 ; USER32.dll!SetRect
  4310f1:	89 5e 2c                                        	mov    DWORD PTR [esi+0x2c],ebx
  4310f4:	8b c6                                           	mov    eax,esi
  4310f6:	5f                                              	pop    edi
  4310f7:	5e                                              	pop    esi
  4310f8:	5d                                              	pop    ebp
  4310f9:	5b                                              	pop    ebx
  4310fa:	c2 04 00                                        	ret    0x4

; 0x5ed8be <= VA < 0x5ed8e8: Child metadata default: +64 from84e9e8, +68 type0xb before type-specific assignment.
  5ed8be:	b9 80 00 00 00                                  	mov    ecx,0x80
  5ed8c3:	33 c0                                           	xor    eax,eax
  5ed8c5:	8d bc 24 c0 00 00 00                            	lea    edi,[esp+0xc0]
  5ed8cc:	6a 04                                           	push   0x4
  5ed8ce:	f3 ab                                           	rep stos DWORD PTR es:[edi],eax
  5ed8d0:	8b 0d e8 e9 84 00                               	mov    ecx,DWORD PTR ds:0x84e9e8
  5ed8d6:	c7 84 24 2c 01 00 00 0b 00 00 00                	mov    DWORD PTR [esp+0x12c],0xb
  5ed8e1:	89 8c 24 28 01 00 00                            	mov    DWORD PTR [esp+0x128],ecx

; 0x5f0d37 <= VA < 0x5f0d59: Button text uses font metadata+64.
  5f0d37:	8b 45 64                                        	mov    eax,DWORD PTR [ebp+0x64]
  5f0d3a:	6a 00                                           	push   0x0
  5f0d3c:	8b 55 28                                        	mov    edx,DWORD PTR [ebp+0x28]
  5f0d3f:	6a 00                                           	push   0x0
  5f0d41:	6a 00                                           	push   0x0
  5f0d43:	6a 0c                                           	push   0xc
  5f0d45:	6a 05                                           	push   0x5
  5f0d47:	57                                              	push   edi
  5f0d48:	8d 4c 24 30                                     	lea    ecx,[esp+0x30]
  5f0d4c:	50                                              	push   eax
  5f0d4d:	51                                              	push   ecx
  5f0d4e:	8b 0d 58 99 83 00                               	mov    ecx,DWORD PTR ds:0x839958
  5f0d54:	e8 c7 d2 00 00                                  	call   0x5fe020

; 0x5fe020 <= VA < 0x5fe130: Text rectangle measurement and final text dispatch; not a measured glyph baseline.
  5fe020:	83 ec 10                                        	sub    esp,0x10
  5fe023:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5fe027:	53                                              	push   ebx
  5fe028:	33 db                                           	xor    ebx,ebx
  5fe02a:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  5fe02e:	8a 0d cc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fcc
  5fe034:	8a dc                                           	mov    bl,ah
  5fe036:	81 e3 ff 00 00 00                               	and    ebx,0xff
  5fe03c:	55                                              	push   ebp
  5fe03d:	d3 eb                                           	shr    ebx,cl
  5fe03f:	8b 0d c8 2f 85 00                               	mov    ecx,DWORD PTR ds:0x852fc8
  5fe045:	56                                              	push   esi
  5fe046:	8b f0                                           	mov    esi,eax
  5fe048:	25 ff 00 00 00                                  	and    eax,0xff
  5fe04d:	c1 ee 10                                        	shr    esi,0x10
  5fe050:	d3 e3                                           	shl    ebx,cl
  5fe052:	8a 0d c4 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fc4
  5fe058:	81 e6 ff 00 00 00                               	and    esi,0xff
  5fe05e:	d3 ee                                           	shr    esi,cl
  5fe060:	8b 0d c0 2f 85 00                               	mov    ecx,DWORD PTR ds:0x852fc0
  5fe066:	57                                              	push   edi
  5fe067:	89 54 24 18                                     	mov    DWORD PTR [esp+0x18],edx
  5fe06b:	d3 e6                                           	shl    esi,cl
  5fe06d:	8a 0d bc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fbc
  5fe073:	d3 e8                                           	shr    eax,cl
  5fe075:	8b 0d b8 2f 85 00                               	mov    ecx,DWORD PTR ds:0x852fb8
  5fe07b:	0b de                                           	or     ebx,esi
  5fe07d:	8b 74 24 24                                     	mov    esi,DWORD PTR [esp+0x24]
  5fe081:	8b 6e 0c                                        	mov    ebp,DWORD PTR [esi+0xc]
  5fe084:	8b 7e 08                                        	mov    edi,DWORD PTR [esi+0x8]
  5fe087:	d3 e0                                           	shl    eax,cl
  5fe089:	8b 0e                                           	mov    ecx,DWORD PTR [esi]
  5fe08b:	2b f9                                           	sub    edi,ecx
  5fe08d:	89 4c 24 14                                     	mov    DWORD PTR [esp+0x14],ecx
  5fe091:	0b d8                                           	or     ebx,eax
  5fe093:	8b 46 04                                        	mov    eax,DWORD PTR [esi+0x4]
  5fe096:	89 44 24 2c                                     	mov    DWORD PTR [esp+0x2c],eax
  5fe09a:	2b e8                                           	sub    ebp,eax
  5fe09c:	8a 44 24 30                                     	mov    al,BYTE PTR [esp+0x30]
  5fe0a0:	89 5c 24 10                                     	mov    DWORD PTR [esp+0x10],ebx
  5fe0a4:	8b 5c 24 28                                     	mov    ebx,DWORD PTR [esp+0x28]
  5fe0a8:	a8 04                                           	test   al,0x4
  5fe0aa:	74 2a                                           	je     0x5fe0d6
  5fe0ac:	8d 44 24 24                                     	lea    eax,[esp+0x24]
  5fe0b0:	57                                              	push   edi
  5fe0b1:	8d 4c 24 2c                                     	lea    ecx,[esp+0x2c]
  5fe0b5:	50                                              	push   eax
  5fe0b6:	51                                              	push   ecx
  5fe0b7:	52                                              	push   edx
  5fe0b8:	8b cb                                           	mov    ecx,ebx
  5fe0ba:	e8 f1 33 e3 ff                                  	call   0x4314b0
  5fe0bf:	8b c5                                           	mov    eax,ebp
  5fe0c1:	8b 54 24 24                                     	mov    edx,DWORD PTR [esp+0x24]
  5fe0c5:	8b 4c 24 2c                                     	mov    ecx,DWORD PTR [esp+0x2c]
  5fe0c9:	2b c2                                           	sub    eax,edx
  5fe0cb:	99                                              	cdq
  5fe0cc:	2b c2                                           	sub    eax,edx
  5fe0ce:	d1 f8                                           	sar    eax,1
  5fe0d0:	03 c8                                           	add    ecx,eax
  5fe0d2:	89 4c 24 2c                                     	mov    DWORD PTR [esp+0x2c],ecx
  5fe0d6:	6a 01                                           	push   0x1
  5fe0d8:	8b cb                                           	mov    ecx,ebx
  5fe0da:	e8 71 33 e3 ff                                  	call   0x431450
  5fe0df:	8b cb                                           	mov    ecx,ebx
  5fe0e1:	56                                              	push   esi
  5fe0e2:	e8 79 33 e3 ff                                  	call   0x431460
  5fe0e7:	8b cb                                           	mov    ecx,ebx
  5fe0e9:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  5fe0ed:	52                                              	push   edx
  5fe0ee:	e8 3d 33 e3 ff                                  	call   0x431430
  5fe0f3:	8b 44 24 40                                     	mov    eax,DWORD PTR [esp+0x40]
  5fe0f7:	8b 4c 24 3c                                     	mov    ecx,DWORD PTR [esp+0x3c]
  5fe0fb:	8b 54 24 30                                     	mov    edx,DWORD PTR [esp+0x30]
  5fe0ff:	50                                              	push   eax
  5fe100:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5fe104:	51                                              	push   ecx
  5fe105:	8b 4c 24 1c                                     	mov    ecx,DWORD PTR [esp+0x1c]
  5fe109:	52                                              	push   edx
  5fe10a:	8b 54 24 24                                     	mov    edx,DWORD PTR [esp+0x24]
  5fe10e:	55                                              	push   ebp
  5fe10f:	57                                              	push   edi
  5fe110:	50                                              	push   eax
  5fe111:	8b 44 24 34                                     	mov    eax,DWORD PTR [esp+0x34]
  5fe115:	51                                              	push   ecx
  5fe116:	8b 0d d0 e9 84 00                               	mov    ecx,DWORD PTR ds:0x84e9d0
  5fe11c:	52                                              	push   edx
  5fe11d:	50                                              	push   eax
  5fe11e:	53                                              	push   ebx
  5fe11f:	e8 6c 43 e3 ff                                  	call   0x432490
  5fe124:	33 c0                                           	xor    eax,eax
  5fe126:	5f                                              	pop    edi
  5fe127:	5e                                              	pop    esi
  5fe128:	5d                                              	pop    ebp
  5fe129:	5b                                              	pop    ebx
  5fe12a:	83 c4 10                                        	add    esp,0x10
  5fe12d:	c2 20 00                                        	ret    0x20
