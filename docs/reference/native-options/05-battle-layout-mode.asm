; READ-ONLY STATIC EVIDENCE. The supplied base-RA2 executable is modified (.detour, xwis.dll).
; Not a clean-retail screenshot, execution trace, or certification.
; Input SHA256: 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; Generated with objdump -d -Mintel --insn-width=16 and explicit VA ranges.

; 0x481d92 <= VA < 0x481de9: Battle menu entry calls flag setter, menu dispatcher loop, then flag clearer.
  481d92:	a1 90 d2 a3 00                                  	mov    eax,ds:0xa3d290
  481d97:	8a 88 06 23 00 00                               	mov    cl,BYTE PTR [eax+0x2306]
  481d9d:	89 1d 48 0d a4 00                               	mov    DWORD PTR ds:0xa40d48,ebx
  481da3:	88 0d 44 0d a4 00                               	mov    BYTE PTR ds:0xa40d44,cl
  481da9:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  481dae:	c6 05 e0 88 7d 00 01                            	mov    BYTE PTR ds:0x7d88e0,0x1
  481db5:	e8 26 10 1f 00                                  	call   0x672de0
  481dba:	e8 11 de 0b 00                                  	call   0x53fbd0
  481dbf:	84 c0                                           	test   al,al
  481dc1:	74 09                                           	je     0x481dcc
  481dc3:	e8 78 da 0b 00                                  	call   0x53f840
  481dc8:	84 c0                                           	test   al,al
  481dca:	75 0e                                           	jne    0x481dda
  481dcc:	e8 7f fa ff ff                                  	call   0x481850
  481dd1:	e8 6a da 0b 00                                  	call   0x53f840
  481dd6:	84 c0                                           	test   al,al
  481dd8:	74 e0                                           	je     0x481dba
  481dda:	e8 d1 13 27 00                                  	call   0x6f31b0
  481ddf:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  481de4:	e8 87 10 1f 00                                  	call   0x672e70

; 0x672de0 <= VA < 0x672f17: Flag setter/clearer/getter. ECX=a3d298; field3080 is a40318. Setter requires a40958 != 0.
  672de0:	8a 81 80 30 00 00                               	mov    al,BYTE PTR [ecx+0x3080]
  672de6:	84 c0                                           	test   al,al
  672de8:	0f 85 81 00 00 00                               	jne    0x672e6f
  672dee:	a0 58 09 a4 00                                  	mov    al,ds:0xa40958
  672df3:	84 c0                                           	test   al,al
  672df5:	74 78                                           	je     0x672e6f
  672df7:	c6 81 80 30 00 00 01                            	mov    BYTE PTR [ecx+0x3080],0x1
  672dfe:	a1 30 32 7f 00                                  	mov    eax,ds:0x7f3230
  672e03:	83 f8 ff                                        	cmp    eax,0xffffffff
  672e06:	75 0a                                           	jne    0x672e12
  672e08:	a1 18 0b a4 00                                  	mov    eax,ds:0xa40b18
  672e0d:	a3 30 32 7f 00                                  	mov    ds:0x7f3230,eax
  672e12:	83 39 00                                        	cmp    DWORD PTR [ecx],0x0
  672e15:	75 0a                                           	jne    0x672e21
  672e17:	c7 05 18 0b a4 00 02 00 00 00                   	mov    DWORD PTR ds:0xa40b18,0x2
  672e21:	8b 0d 90 d2 a3 00                               	mov    ecx,DWORD PTR ds:0xa3d290
  672e27:	8a 81 06 23 00 00                               	mov    al,BYTE PTR [ecx+0x2306]
  672e2d:	84 c0                                           	test   al,al
  672e2f:	75 14                                           	jne    0x672e45
  672e31:	e8 9a 95 fe ff                                  	call   0x65c3d0
  672e36:	8b 15 2c 0d a4 00                               	mov    edx,DWORD PTR ds:0xa40d2c
  672e3c:	83 c2 03                                        	add    edx,0x3
  672e3f:	89 15 74 91 ab 00                               	mov    DWORD PTR ds:0xab9174,edx
  672e45:	8b 0d 68 9c 83 00                               	mov    ecx,DWORD PTR ds:0x839c68
  672e4b:	8b 01                                           	mov    eax,DWORD PTR [ecx]
  672e4d:	ff 50 1c                                        	call   DWORD PTR [eax+0x1c]
  672e50:	84 c0                                           	test   al,al
  672e52:	75 0b                                           	jne    0x672e5f
  672e54:	8b 0d 68 9c 83 00                               	mov    ecx,DWORD PTR ds:0x839c68
  672e5a:	8b 11                                           	mov    edx,DWORD PTR [ecx]
  672e5c:	ff 52 18                                        	call   DWORD PTR [edx+0x18]
  672e5f:	8b 0d 68 14 83 00                               	mov    ecx,DWORD PTR ds:0x831468
  672e65:	ba 00 40 00 00                                  	mov    edx,0x4000
  672e6a:	e9 11 42 d9 ff                                  	jmp    0x407080
  672e6f:	c3                                              	ret
  672e70:	8a 81 80 30 00 00                               	mov    al,BYTE PTR [ecx+0x3080]
  672e76:	84 c0                                           	test   al,al
  672e78:	0f 84 8e 00 00 00                               	je     0x672f0c
  672e7e:	c6 81 80 30 00 00 00                            	mov    BYTE PTR [ecx+0x3080],0x0
  672e85:	a1 30 32 7f 00                                  	mov    eax,ds:0x7f3230
  672e8a:	83 f8 ff                                        	cmp    eax,0xffffffff
  672e8d:	74 0f                                           	je     0x672e9e
  672e8f:	a3 18 0b a4 00                                  	mov    ds:0xa40b18,eax
  672e94:	c7 05 30 32 7f 00 ff ff ff ff                   	mov    DWORD PTR ds:0x7f3230,0xffffffff
  672e9e:	e8 fd 44 ea ff                                  	call   0x5173a0
  672ea3:	e8 38 db f2 ff                                  	call   0x5a09e0
  672ea8:	e8 13 3f d9 ff                                  	call   0x406dc0
  672ead:	e8 5e 15 0a 00                                  	call   0x714410
  672eb2:	e8 e9 3a 0a 00                                  	call   0x7169a0
  672eb7:	e8 14 32 0a 00                                  	call   0x7160d0
  672ebc:	8b 0d 68 14 83 00                               	mov    ecx,DWORD PTR ds:0x831468
  672ec2:	ba 00 40 00 00                                  	mov    edx,0x4000
  672ec7:	e8 b4 41 d9 ff                                  	call   0x407080
  672ecc:	8b 0d b0 99 83 00                               	mov    ecx,DWORD PTR ds:0x8399b0
  672ed2:	85 c9                                           	test   ecx,ecx
  672ed4:	74 07                                           	je     0x672edd
  672ed6:	6a 00                                           	push   0x0
  672ed8:	e8 a3 85 07 00                                  	call   0x6eb480
  672edd:	8b 0d 68 9c 83 00                               	mov    ecx,DWORD PTR ds:0x839c68
  672ee3:	8b 01                                           	mov    eax,DWORD PTR [ecx]
  672ee5:	ff 50 1c                                        	call   DWORD PTR [eax+0x1c]
  672ee8:	84 c0                                           	test   al,al
  672eea:	74 0b                                           	je     0x672ef7
  672eec:	8b 0d 68 9c 83 00                               	mov    ecx,DWORD PTR ds:0x839c68
  672ef2:	8b 11                                           	mov    edx,DWORD PTR [ecx]
  672ef4:	ff 52 14                                        	call   DWORD PTR [edx+0x14]
  672ef7:	8b 0d 68 9c 83 00                               	mov    ecx,DWORD PTR ds:0x839c68
  672efd:	8b 01                                           	mov    eax,DWORD PTR [ecx]
  672eff:	ff 50 0c                                        	call   DWORD PTR [eax+0xc]
  672f02:	c7 05 74 91 ab 00 00 00 00 00                   	mov    DWORD PTR ds:0xab9174,0x0
  672f0c:	c3                                              	ret
  672f0d:	90                                              	nop
  672f0e:	90                                              	nop
  672f0f:	90                                              	nop
  672f10:	8a 81 80 30 00 00                               	mov    al,BYTE PTR [ecx+0x3080]
  672f16:	c3                                              	ret

; 0x5ed5f2 <= VA < 0x5ed659: Class literal7ead6c is Button. BS_OWNERDRAW branch chooses proc5f0320 and metadata type0.
  5ed5f2:	be 6c ad 7e 00                                  	mov    esi,0x7ead6c
  5ed5f7:	8d 44 24 20                                     	lea    eax,[esp+0x20]
  5ed5fb:	8a 10                                           	mov    dl,BYTE PTR [eax]
  5ed5fd:	8a ca                                           	mov    cl,dl
  5ed5ff:	3a 16                                           	cmp    dl,BYTE PTR [esi]
  5ed601:	75 1c                                           	jne    0x5ed61f
  5ed603:	3a cb                                           	cmp    cl,bl
  5ed605:	74 14                                           	je     0x5ed61b
  5ed607:	8a 50 01                                        	mov    dl,BYTE PTR [eax+0x1]
  5ed60a:	8a ca                                           	mov    cl,dl
  5ed60c:	3a 56 01                                        	cmp    dl,BYTE PTR [esi+0x1]
  5ed60f:	75 0e                                           	jne    0x5ed61f
  5ed611:	83 c0 02                                        	add    eax,0x2
  5ed614:	83 c6 02                                        	add    esi,0x2
  5ed617:	3a cb                                           	cmp    cl,bl
  5ed619:	75 e0                                           	jne    0x5ed5fb
  5ed61b:	33 c0                                           	xor    eax,eax
  5ed61d:	eb 05                                           	jmp    0x5ed624
  5ed61f:	1b c0                                           	sbb    eax,eax
  5ed621:	83 d8 ff                                        	sbb    eax,0xffffffff
  5ed624:	3b c3                                           	cmp    eax,ebx
  5ed626:	75 58                                           	jne    0x5ed680
  5ed628:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5ed62c:	8b c8                                           	mov    ecx,eax
  5ed62e:	83 e1 07                                        	and    ecx,0x7
  5ed631:	80 f9 07                                        	cmp    cl,0x7
  5ed634:	75 0e                                           	jne    0x5ed644
  5ed636:	bd 20 c0 5f 00                                  	mov    ebp,0x5fc020
  5ed63b:	89 5c 24 10                                     	mov    DWORD PTR [esp+0x10],ebx
  5ed63f:	e9 86 00 00 00                                  	jmp    0x5ed6ca
  5ed644:	8b d0                                           	mov    edx,eax
  5ed646:	83 e2 0b                                        	and    edx,0xb
  5ed649:	80 fa 0b                                        	cmp    dl,0xb
  5ed64c:	75 0b                                           	jne    0x5ed659
  5ed64e:	bd 20 03 5f 00                                  	mov    ebp,0x5f0320
  5ed653:	89 5c 24 10                                     	mov    DWORD PTR [esp+0x10],ebx
  5ed657:	eb 71                                           	jmp    0x5ed6ca

; 0x5eda58 <= VA < 0x5eda66: Store that class/type in child metadata+68.
  5eda58:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5eda5c:	8b 94 24 c8 0a 00 00                            	mov    edx,DWORD PTR [esp+0xac8]
  5eda63:	89 45 68                                        	mov    DWORD PTR [ebp+0x68],eax

; 0x5fff02 <= VA < 0x5fff78: Full-frame initialization passes design constants640,480 into5e9f00.
  5fff02:	8b d3                                           	mov    edx,ebx
  5fff04:	8b ce                                           	mov    ecx,esi
  5fff06:	e8 95 ab fe ff                                  	call   0x5eaaa0
  5fff0b:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5fff10:	e8 fb 2f 07 00                                  	call   0x672f10
  5fff15:	84 c0                                           	test   al,al
  5fff17:	75 07                                           	jne    0x5fff20
  5fff19:	8b ce                                           	mov    ecx,esi
  5fff1b:	e8 40 aa fe ff                                  	call   0x5ea960
  5fff20:	8b ce                                           	mov    ecx,esi
  5fff22:	e8 29 a6 fe ff                                  	call   0x5ea550
  5fff27:	8b ce                                           	mov    ecx,esi
  5fff29:	e8 62 a4 fe ff                                  	call   0x5ea390
  5fff2e:	8b ce                                           	mov    ecx,esi
  5fff30:	e8 eb a7 fe ff                                  	call   0x5ea720
  5fff35:	8b ce                                           	mov    ecx,esi
  5fff37:	e8 d4 a8 fe ff                                  	call   0x5ea810
  5fff3c:	55                                              	push   ebp
  5fff3d:	68 20 87 5e 00                                  	push   0x5e8720
  5fff42:	56                                              	push   esi
  5fff43:	ff d7                                           	call   edi
  5fff45:	8b ce                                           	mov    ecx,esi
  5fff47:	e8 54 a0 fe ff                                  	call   0x5e9fa0
  5fff4c:	84 c0                                           	test   al,al
  5fff4e:	0f 84 c6 00 00 00                               	je     0x60001a
  5fff54:	8b 0d 68 dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add68
  5fff5a:	8b 15 74 dd 7a 00                               	mov    edx,DWORD PTR ds:0x7add74
  5fff60:	89 4c 24 28                                     	mov    DWORD PTR [esp+0x28],ecx
  5fff64:	89 54 24 2c                                     	mov    DWORD PTR [esp+0x2c],edx
  5fff68:	8d 54 24 28                                     	lea    edx,[esp+0x28]
  5fff6c:	8b ce                                           	mov    ecx,esi
  5fff6e:	e8 8d 9f fe ff                                  	call   0x5e9f00
  5fff73:	e9 a9 00 00 00                                  	jmp    0x600021

; 0x600021 <= VA < 0x60004d: After placement: paint/style and text metadata enumeration.
  600021:	55                                              	push   ebp
  600022:	68 b0 7e 5e 00                                  	push   0x5e7eb0
  600027:	56                                              	push   esi
  600028:	ff d7                                           	call   edi
  60002a:	55                                              	push   ebp
  60002b:	68 30 81 5e 00                                  	push   0x5e8130
  600030:	56                                              	push   esi
  600031:	ff d7                                           	call   edi
  600033:	8b ce                                           	mov    ecx,esi
  600035:	e8 26 70 13 00                                  	call   0x737060
  60003a:	56                                              	push   esi
  60003b:	ff 15 8c a3 79 00                               	call   DWORD PTR ds:0x79a38c ; USER32.dll!SetFocus
  600041:	33 c0                                           	xor    eax,eax
  600043:	5f                                              	pop    edi
  600044:	5e                                              	pop    esi
  600045:	5d                                              	pop    ebp
  600046:	5b                                              	pop    ebx
  600047:	83 c4 30                                        	add    esp,0x30
  60004a:	c2 08 00                                        	ret    0x8

; 0x5e9f00 <= VA < 0x5e9fa0: Parent becomes viewport rectangle0,0,W,H; children enumerated through5e9bb0.
  5e9f00:	a1 e4 23 85 00                                  	mov    eax,ds:0x8523e4
  5e9f05:	56                                              	push   esi
  5e9f06:	8b f1                                           	mov    esi,ecx
  5e9f08:	57                                              	push   edi
  5e9f09:	8b 0d e0 23 85 00                               	mov    ecx,DWORD PTR ds:0x8523e0
  5e9f0f:	6a 00                                           	push   0x0
  5e9f11:	50                                              	push   eax
  5e9f12:	51                                              	push   ecx
  5e9f13:	6a 00                                           	push   0x0
  5e9f15:	6a 00                                           	push   0x0
  5e9f17:	8b fa                                           	mov    edi,edx
  5e9f19:	56                                              	push   esi
  5e9f1a:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9f20:	89 35 cc 63 a7 00                               	mov    DWORD PTR ds:0xa763cc,esi
  5e9f26:	57                                              	push   edi
  5e9f27:	68 b0 9b 5e 00                                  	push   0x5e9bb0
  5e9f2c:	56                                              	push   esi
  5e9f2d:	ff 15 dc a4 79 00                               	call   DWORD PTR ds:0x79a4dc ; USER32.dll!EnumChildWindows
  5e9f33:	5f                                              	pop    edi
  5e9f34:	5e                                              	pop    esi
  5e9f35:	c3                                              	ret
  5e9f36:	90                                              	nop
  5e9f37:	90                                              	nop
  5e9f38:	90                                              	nop
  5e9f39:	90                                              	nop
  5e9f3a:	90                                              	nop
  5e9f3b:	90                                              	nop
  5e9f3c:	90                                              	nop
  5e9f3d:	90                                              	nop
  5e9f3e:	90                                              	nop
  5e9f3f:	90                                              	nop
  5e9f40:	51                                              	push   ecx
  5e9f41:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e9f46:	89 4c 24 00                                     	mov    DWORD PTR [esp+0x0],ecx
  5e9f4a:	85 c0                                           	test   eax,eax
  5e9f4c:	74 38                                           	je     0x5e9f86
  5e9f4e:	8d 4c 24 00                                     	lea    ecx,[esp+0x0]
  5e9f52:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e9f58:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e9f5e:	ba 01 00 00 00                                  	mov    edx,0x1
  5e9f63:	d3 e2                                           	shl    edx,cl
  5e9f65:	4a                                              	dec    edx
  5e9f66:	23 d0                                           	and    edx,eax
  5e9f68:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e9f6d:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e9f70:	85 c0                                           	test   eax,eax
  5e9f72:	74 12                                           	je     0x5e9f86
  5e9f74:	8b 4c 24 00                                     	mov    ecx,DWORD PTR [esp+0x0]
  5e9f78:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e9f7a:	74 0e                                           	je     0x5e9f8a
  5e9f7c:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e9f82:	85 c0                                           	test   eax,eax
  5e9f84:	75 f2                                           	jne    0x5e9f78
  5e9f86:	33 c0                                           	xor    eax,eax
  5e9f88:	59                                              	pop    ecx
  5e9f89:	c3                                              	ret
  5e9f8a:	85 c0                                           	test   eax,eax
  5e9f8c:	74 f8                                           	je     0x5e9f86
  5e9f8e:	83 c0 04                                        	add    eax,0x4
  5e9f91:	85 c0                                           	test   eax,eax
  5e9f93:	74 f1                                           	je     0x5e9f86
  5e9f95:	8b 40 74                                        	mov    eax,DWORD PTR [eax+0x74]
  5e9f98:	59                                              	pop    ecx
  5e9f99:	c3                                              	ret
  5e9f9a:	90                                              	nop
  5e9f9b:	90                                              	nop
  5e9f9c:	90                                              	nop
  5e9f9d:	90                                              	nop
  5e9f9e:	90                                              	nop
  5e9f9f:	90                                              	nop

; 0x5fef8d <= VA < 0x5fefbf: Full-frame parent paint selects battle compositor6f4620 when pause flag true.
  5fef8d:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5fef91:	8b 93 b0 00 00 00                               	mov    edx,DWORD PTR [ebx+0xb0]
  5fef97:	83 fa 01                                        	cmp    edx,0x1
  5fef9a:	0f 85 11 02 00 00                               	jne    0x5ff1b1
  5fefa0:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5fefa5:	e8 66 3f 07 00                                  	call   0x672f10
  5fefaa:	84 c0                                           	test   al,al
  5fefac:	74 11                                           	je     0x5fefbf
  5fefae:	55                                              	push   ebp
  5fefaf:	8d 54 24 2c                                     	lea    edx,[esp+0x2c]
  5fefb3:	8b ce                                           	mov    ecx,esi
  5fefb5:	e8 66 56 0f 00                                  	call   0x6f4620
  5fefba:	e9 5c 03 00 00                                  	jmp    0x5ff31b
