; READ-ONLY STATIC EVIDENCE. The supplied base-RA2 executable is modified (.detour, xwis.dll).
; Not a clean-retail screenshot, execution trace, or certification.
; Input SHA256: 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; Generated with objdump -d -Mintel --insn-width=16 and explicit VA ranges.

; 0x5e8009 <= VA < 0x5e8112: Battle right/bottom ownerdraw buttons receive paint mode2.
  5e8009:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e800e:	e8 fd ae 08 00                                  	call   0x672f10
  5e8013:	84 c0                                           	test   al,al
  5e8015:	0f 84 93 00 00 00                               	je     0x5e80ae
  5e801b:	6a f0                                           	push   0xfffffff0
  5e801d:	56                                              	push   esi
  5e801e:	ff d7                                           	call   edi
  5e8020:	83 e0 0b                                        	and    eax,0xb
  5e8023:	3c 0b                                           	cmp    al,0xb
  5e8025:	75 40                                           	jne    0x5e8067
  5e8027:	8d 44 24 10                                     	lea    eax,[esp+0x10]
  5e802b:	8d 4c 24 14                                     	lea    ecx,[esp+0x14]
  5e802f:	50                                              	push   eax
  5e8030:	51                                              	push   ecx
  5e8031:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e8036:	89 74 24 1c                                     	mov    DWORD PTR [esp+0x1c],esi
  5e803a:	c7 44 24 18 00 00 00 00                         	mov    DWORD PTR [esp+0x18],0x0
  5e8042:	e8 c9 96 01 00                                  	call   0x601710
  5e8047:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e804b:	85 c0                                           	test   eax,eax
  5e804d:	74 18                                           	je     0x5e8067
  5e804f:	8b 48 68                                        	mov    ecx,DWORD PTR [eax+0x68]
  5e8052:	85 c9                                           	test   ecx,ecx
  5e8054:	75 11                                           	jne    0x5e8067
  5e8056:	8b d6                                           	mov    edx,esi
  5e8058:	8b cd                                           	mov    ecx,ebp
  5e805a:	e8 01 e8 ff ff                                  	call   0x5e6860
  5e805f:	84 c0                                           	test   al,al
  5e8061:	0f 85 8f 00 00 00                               	jne    0x5e80f6
  5e8067:	6a f0                                           	push   0xfffffff0
  5e8069:	56                                              	push   esi
  5e806a:	ff d7                                           	call   edi
  5e806c:	83 e0 0b                                        	and    eax,0xb
  5e806f:	3c 0b                                           	cmp    al,0xb
  5e8071:	75 3b                                           	jne    0x5e80ae
  5e8073:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e8078:	89 74 24 0c                                     	mov    DWORD PTR [esp+0xc],esi
  5e807c:	85 c0                                           	test   eax,eax
  5e807e:	74 2e                                           	je     0x5e80ae
  5e8080:	8d 54 24 0c                                     	lea    edx,[esp+0xc]
  5e8084:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e8089:	52                                              	push   edx
  5e808a:	e8 91 9f 01 00                                  	call   0x602020
  5e808f:	8b 0d 40 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa73640
  5e8095:	8b 04 81                                        	mov    eax,DWORD PTR [ecx+eax*4]
  5e8098:	85 c0                                           	test   eax,eax
  5e809a:	74 12                                           	je     0x5e80ae
  5e809c:	8b 4c 24 0c                                     	mov    ecx,DWORD PTR [esp+0xc]
  5e80a0:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e80a2:	74 33                                           	je     0x5e80d7
  5e80a4:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e80aa:	85 c0                                           	test   eax,eax
  5e80ac:	75 f2                                           	jne    0x5e80a0
  5e80ae:	8b d6                                           	mov    edx,esi
  5e80b0:	8b cd                                           	mov    ecx,ebp
  5e80b2:	e8 e9 f8 ff ff                                  	call   0x5e79a0
  5e80b7:	84 c0                                           	test   al,al
  5e80b9:	74 0e                                           	je     0x5e80c9
  5e80bb:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5e80bf:	c7 80 b0 00 00 00 03 00 00 00                   	mov    DWORD PTR [eax+0xb0],0x3
  5e80c9:	5f                                              	pop    edi
  5e80ca:	5e                                              	pop    esi
  5e80cb:	b8 01 00 00 00                                  	mov    eax,0x1
  5e80d0:	5d                                              	pop    ebp
  5e80d1:	83 c4 0c                                        	add    esp,0xc
  5e80d4:	c2 08 00                                        	ret    0x8
  5e80d7:	85 c0                                           	test   eax,eax
  5e80d9:	74 d3                                           	je     0x5e80ae
  5e80db:	83 c0 04                                        	add    eax,0x4
  5e80de:	85 c0                                           	test   eax,eax
  5e80e0:	74 cc                                           	je     0x5e80ae
  5e80e2:	8b 48 68                                        	mov    ecx,DWORD PTR [eax+0x68]
  5e80e5:	85 c9                                           	test   ecx,ecx
  5e80e7:	75 c5                                           	jne    0x5e80ae
  5e80e9:	8b d6                                           	mov    edx,esi
  5e80eb:	8b cd                                           	mov    ecx,ebp
  5e80ed:	e8 ce f1 ff ff                                  	call   0x5e72c0
  5e80f2:	84 c0                                           	test   al,al
  5e80f4:	74 b8                                           	je     0x5e80ae
  5e80f6:	8b 54 24 1c                                     	mov    edx,DWORD PTR [esp+0x1c]
  5e80fa:	5f                                              	pop    edi
  5e80fb:	5e                                              	pop    esi
  5e80fc:	b8 01 00 00 00                                  	mov    eax,0x1
  5e8101:	c7 82 b0 00 00 00 02 00 00 00                   	mov    DWORD PTR [edx+0xb0],0x2
  5e810b:	5d                                              	pop    ebp
  5e810c:	83 c4 0c                                        	add    esp,0xc
  5e810f:	c2 08 00                                        	ret    0x8

; 0x6f45f0 <= VA < 0x6f45f6: Sidebar palette converter getter returnsac11a4.
  6f45f0:	a1 a4 11 ac 00                                  	mov    eax,ds:0xac11a4
  6f45f5:	c3                                              	ret

; 0x5fe380 <= VA < 0x5fe48a: ODT_BUTTON(4): DRAWITEMSTRUCT.itemState at+10 copied to metadata+e8.
  5fe380:	a1 50 99 83 00                                  	mov    eax,ds:0x839950
  5fe385:	83 ec 24                                        	sub    esp,0x24
  5fe388:	85 c0                                           	test   eax,eax
  5fe38a:	53                                              	push   ebx
  5fe38b:	56                                              	push   esi
  5fe38c:	8b d9                                           	mov    ebx,ecx
  5fe38e:	0f 84 f0 00 00 00                               	je     0x5fe484
  5fe394:	a1 58 99 83 00                                  	mov    eax,ds:0x839958
  5fe399:	85 c0                                           	test   eax,eax
  5fe39b:	0f 84 e3 00 00 00                               	je     0x5fe484
  5fe3a1:	8b 4b 14                                        	mov    ecx,DWORD PTR [ebx+0x14]
  5fe3a4:	8d 54 24 0c                                     	lea    edx,[esp+0xc]
  5fe3a8:	e8 e3 72 13 00                                  	call   0x735690
  5fe3ad:	8b 4b 14                                        	mov    ecx,DWORD PTR [ebx+0x14]
  5fe3b0:	8d 44 24 1c                                     	lea    eax,[esp+0x1c]
  5fe3b4:	50                                              	push   eax
  5fe3b5:	51                                              	push   ecx
  5fe3b6:	ff 15 b8 a4 79 00                               	call   DWORD PTR ds:0x79a4b8 ; USER32.dll!GetClientRect
  5fe3bc:	8b 53 14                                        	mov    edx,DWORD PTR [ebx+0x14]
  5fe3bf:	6a f0                                           	push   0xfffffff0
  5fe3c1:	52                                              	push   edx
  5fe3c2:	ff 15 8c a4 79 00                               	call   DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  5fe3c8:	a9 00 00 80 00                                  	test   eax,0x800000
  5fe3cd:	74 3a                                           	je     0x5fe409
  5fe3cf:	57                                              	push   edi
  5fe3d0:	8b 3d dc a3 79 00                               	mov    edi,DWORD PTR ds:0x79a3dc ; USER32.dll!GetSystemMetrics
  5fe3d6:	6a 05                                           	push   0x5
  5fe3d8:	ff d7                                           	call   edi
  5fe3da:	8b f0                                           	mov    esi,eax
  5fe3dc:	6a 06                                           	push   0x6
  5fe3de:	ff d7                                           	call   edi
  5fe3e0:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5fe3e4:	8b 7c 24 18                                     	mov    edi,DWORD PTR [esp+0x18]
  5fe3e8:	8b 54 24 14                                     	mov    edx,DWORD PTR [esp+0x14]
  5fe3ec:	03 ce                                           	add    ecx,esi
  5fe3ee:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  5fe3f2:	8b 4c 24 1c                                     	mov    ecx,DWORD PTR [esp+0x1c]
  5fe3f6:	2b fe                                           	sub    edi,esi
  5fe3f8:	03 d0                                           	add    edx,eax
  5fe3fa:	2b c8                                           	sub    ecx,eax
  5fe3fc:	89 7c 24 18                                     	mov    DWORD PTR [esp+0x18],edi
  5fe400:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  5fe404:	89 4c 24 1c                                     	mov    DWORD PTR [esp+0x1c],ecx
  5fe408:	5f                                              	pop    edi
  5fe409:	83 3b 04                                        	cmp    DWORD PTR [ebx],0x4
  5fe40c:	75 76                                           	jne    0x5fe484
  5fe40e:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5fe413:	8b 73 14                                        	mov    esi,DWORD PTR [ebx+0x14]
  5fe416:	85 c0                                           	test   eax,eax
  5fe418:	89 74 24 08                                     	mov    DWORD PTR [esp+0x8],esi
  5fe41c:	74 66                                           	je     0x5fe484
  5fe41e:	8d 4c 24 08                                     	lea    ecx,[esp+0x8]
  5fe422:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5fe428:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5fe42e:	ba 01 00 00 00                                  	mov    edx,0x1
  5fe433:	d3 e2                                           	shl    edx,cl
  5fe435:	4a                                              	dec    edx
  5fe436:	23 d0                                           	and    edx,eax
  5fe438:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5fe43d:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5fe440:	85 c0                                           	test   eax,eax
  5fe442:	74 40                                           	je     0x5fe484
  5fe444:	8b 4c 24 08                                     	mov    ecx,DWORD PTR [esp+0x8]
  5fe448:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5fe44a:	74 10                                           	je     0x5fe45c
  5fe44c:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5fe452:	85 c0                                           	test   eax,eax
  5fe454:	75 f2                                           	jne    0x5fe448
  5fe456:	5e                                              	pop    esi
  5fe457:	5b                                              	pop    ebx
  5fe458:	83 c4 24                                        	add    esp,0x24
  5fe45b:	c3                                              	ret
  5fe45c:	85 c0                                           	test   eax,eax
  5fe45e:	74 24                                           	je     0x5fe484
  5fe460:	83 c0 04                                        	add    eax,0x4
  5fe463:	85 c0                                           	test   eax,eax
  5fe465:	74 1d                                           	je     0x5fe484
  5fe467:	8b 4b 10                                        	mov    ecx,DWORD PTR [ebx+0x10]
  5fe46a:	83 c3 1c                                        	add    ebx,0x1c
  5fe46d:	6a 00                                           	push   0x0
  5fe46f:	53                                              	push   ebx
  5fe470:	56                                              	push   esi
  5fe471:	89 88 e8 00 00 00                               	mov    DWORD PTR [eax+0xe8],ecx
  5fe477:	ff 15 94 a4 79 00                               	call   DWORD PTR ds:0x79a494 ; USER32.dll!InvalidateRect
  5fe47d:	56                                              	push   esi
  5fe47e:	ff 15 6c a4 79 00                               	call   DWORD PTR ds:0x79a46c ; USER32.dll!UpdateWindow
  5fe484:	5e                                              	pop    esi
  5fe485:	5b                                              	pop    ebx
  5fe486:	83 c4 24                                        	add    esp,0x24
  5fe489:	c3                                              	ret

; 0x5f04be <= VA < 0x5f0510: Button paint reads metadata+e8 and Windows style; message113 goes to timer toggle.
  5f04be:	8b 84 24 08 01 00 00                            	mov    eax,DWORD PTR [esp+0x108]
  5f04c5:	8b 95 e8 00 00 00                               	mov    edx,DWORD PTR [ebp+0xe8]
  5f04cb:	6a f0                                           	push   0xfffffff0
  5f04cd:	50                                              	push   eax
  5f04ce:	89 54 24 34                                     	mov    DWORD PTR [esp+0x34],edx
  5f04d2:	ff 15 8c a4 79 00                               	call   DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  5f04d8:	8b 9c 24 0c 01 00 00                            	mov    ebx,DWORD PTR [esp+0x10c]
  5f04df:	89 44 24 58                                     	mov    DWORD PTR [esp+0x58],eax
  5f04e3:	81 fb 13 01 00 00                               	cmp    ebx,0x113
  5f04e9:	0f 87 de 08 00 00                               	ja     0x5f0dcd
  5f04ef:	0f 84 b0 08 00 00                               	je     0x5f0da5
  5f04f5:	8d 43 fa                                        	lea    eax,[ebx-0x6]
  5f04f8:	83 f8 1b                                        	cmp    eax,0x1b
  5f04fb:	0f 87 db 09 00 00                               	ja     0x5f0edc
  5f0501:	33 c9                                           	xor    ecx,ecx
  5f0503:	8a 88 1c 0f 5f 00                               	mov    cl,BYTE PTR [eax+0x5f0f1c]
  5f0509:	ff 24 8d 10 0f 5f 00                            	jmp    DWORD PTR [ecx*4+0x5f0f10]

; 0x5f0637 <= VA < 0x5f093d: Mode2 drawsSIDEBTTN: selected bit1 -> frame1; otherwise flash+c5 ->2; else0. WS_DISABLED changes text color, not frame.
  5f0637:	8b 8d b0 00 00 00                               	mov    ecx,DWORD PTR [ebp+0xb0]
  5f063d:	3b cb                                           	cmp    ecx,ebx
  5f063f:	0f 84 f8 02 00 00                               	je     0x5f093d
  5f0645:	33 db                                           	xor    ebx,ebx
  5f0647:	33 f6                                           	xor    esi,esi
  5f0649:	83 f9 01                                        	cmp    ecx,0x1
  5f064c:	89 74 24 40                                     	mov    DWORD PTR [esp+0x40],esi
  5f0650:	89 5c 24 28                                     	mov    DWORD PTR [esp+0x28],ebx
  5f0654:	89 5c 24 14                                     	mov    DWORD PTR [esp+0x14],ebx
  5f0658:	75 3e                                           	jne    0x5f0698
  5f065a:	e8 61 2e 10 00                                  	call   0x6f34c0
  5f065f:	8a 4c 24 2c                                     	mov    cl,BYTE PTR [esp+0x2c]
  5f0663:	8b 1d b8 10 ac 00                               	mov    ebx,DWORD PTR ds:0xac10b8
  5f0669:	8b f0                                           	mov    esi,eax
  5f066b:	89 5c 24 28                                     	mov    DWORD PTR [esp+0x28],ebx
  5f066f:	f6 c1 01                                        	test   cl,0x1
  5f0672:	89 74 24 40                                     	mov    DWORD PTR [esp+0x40],esi
  5f0676:	b8 02 00 00 00                                  	mov    eax,0x2
  5f067b:	74 0a                                           	je     0x5f0687
  5f067d:	b8 04 00 00 00                                  	mov    eax,0x4
  5f0682:	e9 84 00 00 00                                  	jmp    0x5f070b
  5f0687:	8a 8d c5 00 00 00                               	mov    cl,BYTE PTR [ebp+0xc5]
  5f068d:	84 c9                                           	test   cl,cl
  5f068f:	74 7a                                           	je     0x5f070b
  5f0691:	b8 03 00 00 00                                  	mov    eax,0x3
  5f0696:	eb 73                                           	jmp    0x5f070b
  5f0698:	83 f9 02                                        	cmp    ecx,0x2
  5f069b:	75 33                                           	jne    0x5f06d0
  5f069d:	e8 4e 3f 10 00                                  	call   0x6f45f0
  5f06a2:	8a 4c 24 2c                                     	mov    cl,BYTE PTR [esp+0x2c]
  5f06a6:	8b 1d f8 0f ac 00                               	mov    ebx,DWORD PTR ds:0xac0ff8
  5f06ac:	8b f0                                           	mov    esi,eax
  5f06ae:	33 c0                                           	xor    eax,eax
  5f06b0:	f6 c1 01                                        	test   cl,0x1
  5f06b3:	89 74 24 40                                     	mov    DWORD PTR [esp+0x40],esi
  5f06b7:	89 5c 24 28                                     	mov    DWORD PTR [esp+0x28],ebx
  5f06bb:	74 07                                           	je     0x5f06c4
  5f06bd:	b8 01 00 00 00                                  	mov    eax,0x1
  5f06c2:	eb 47                                           	jmp    0x5f070b
  5f06c4:	8a 8d c5 00 00 00                               	mov    cl,BYTE PTR [ebp+0xc5]
  5f06ca:	84 c9                                           	test   cl,cl
  5f06cc:	74 3d                                           	je     0x5f070b
  5f06ce:	eb 36                                           	jmp    0x5f0706
  5f06d0:	83 f9 03                                        	cmp    ecx,0x3
  5f06d3:	75 3a                                           	jne    0x5f070f
  5f06d5:	e8 76 1b 10 00                                  	call   0x6f2250
  5f06da:	8a 4c 24 2c                                     	mov    cl,BYTE PTR [esp+0x2c]
  5f06de:	8b 1d c0 10 ac 00                               	mov    ebx,DWORD PTR ds:0xac10c0
  5f06e4:	8b f0                                           	mov    esi,eax
  5f06e6:	33 c0                                           	xor    eax,eax
  5f06e8:	f6 c1 01                                        	test   cl,0x1
  5f06eb:	89 74 24 40                                     	mov    DWORD PTR [esp+0x40],esi
  5f06ef:	89 5c 24 28                                     	mov    DWORD PTR [esp+0x28],ebx
  5f06f3:	74 07                                           	je     0x5f06fc
  5f06f5:	b8 01 00 00 00                                  	mov    eax,0x1
  5f06fa:	eb 0f                                           	jmp    0x5f070b
  5f06fc:	8a 8d c5 00 00 00                               	mov    cl,BYTE PTR [ebp+0xc5]
  5f0702:	84 c9                                           	test   cl,cl
  5f0704:	74 05                                           	je     0x5f070b
  5f0706:	b8 02 00 00 00                                  	mov    eax,0x2
  5f070b:	89 44 24 14                                     	mov    DWORD PTR [esp+0x14],eax
  5f070f:	f7 44 24 58 00 00 00 08                         	test   DWORD PTR [esp+0x58],0x8000000
  5f0717:	0f 84 82 01 00 00                               	je     0x5f089f
  5f071d:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5f0722:	e8 e9 27 08 00                                  	call   0x672f10
  5f0727:	84 c0                                           	test   al,al
  5f0729:	0f 84 aa 00 00 00                               	je     0x5f07d9
  5f072f:	8b 15 90 d2 a3 00                               	mov    edx,DWORD PTR ds:0xa3d290
  5f0735:	8a 82 39 22 00 00                               	mov    al,BYTE PTR [edx+0x2239]
  5f073b:	84 c0                                           	test   al,al
  5f073d:	74 57                                           	je     0x5f0796
  5f073f:	8a 0d bc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fbc
  5f0745:	8b 2d b8 2f 85 00                               	mov    ebp,DWORD PTR ds:0x852fb8
  5f074b:	33 c0                                           	xor    eax,eax
  5f074d:	66 8b 1d 09 10 ac 00                            	mov    bx,WORD PTR ds:0xac1009
  5f0754:	a0 08 10 ac 00                                  	mov    al,ds:0xac1008
  5f0759:	8b 15 c4 2f 85 00                               	mov    edx,DWORD PTR ds:0x852fc4
  5f075f:	d3 e8                                           	shr    eax,cl
  5f0761:	8b cd                                           	mov    ecx,ebp
  5f0763:	8b 35 c0 2f 85 00                               	mov    esi,DWORD PTR ds:0x852fc0
  5f0769:	d3 e0                                           	shl    eax,cl
  5f076b:	33 c9                                           	xor    ecx,ecx
  5f076d:	8a cf                                           	mov    cl,bh
  5f076f:	8b f9                                           	mov    edi,ecx
  5f0771:	8a ca                                           	mov    cl,dl
  5f0773:	d3 ef                                           	shr    edi,cl
  5f0775:	8b ce                                           	mov    ecx,esi
  5f0777:	d3 e7                                           	shl    edi,cl
  5f0779:	33 c9                                           	xor    ecx,ecx
  5f077b:	8a cb                                           	mov    cl,bl
  5f077d:	8b d9                                           	mov    ebx,ecx
  5f077f:	8a 0d cc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fcc
  5f0785:	0b c7                                           	or     eax,edi
  5f0787:	8b 3d c8 2f 85 00                               	mov    edi,DWORD PTR ds:0x852fc8
  5f078d:	d3 eb                                           	shr    ebx,cl
  5f078f:	8b cf                                           	mov    ecx,edi
  5f0791:	e9 96 00 00 00                                  	jmp    0x5f082c
  5f0796:	66 8b 1d 01 11 ac 00                            	mov    bx,WORD PTR ds:0xac1101
  5f079d:	8b 15 c4 2f 85 00                               	mov    edx,DWORD PTR ds:0x852fc4
  5f07a3:	8b 35 c0 2f 85 00                               	mov    esi,DWORD PTR ds:0x852fc0
  5f07a9:	33 c0                                           	xor    eax,eax
  5f07ab:	8a c7                                           	mov    al,bh
  5f07ad:	8a ca                                           	mov    cl,dl
  5f07af:	d3 e8                                           	shr    eax,cl
  5f07b1:	8b ce                                           	mov    ecx,esi
  5f07b3:	8b 3d c8 2f 85 00                               	mov    edi,DWORD PTR ds:0x852fc8
  5f07b9:	d3 e0                                           	shl    eax,cl
  5f07bb:	33 c9                                           	xor    ecx,ecx
  5f07bd:	8a cb                                           	mov    cl,bl
  5f07bf:	8b d9                                           	mov    ebx,ecx
  5f07c1:	8a 0d cc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fcc
  5f07c7:	d3 eb                                           	shr    ebx,cl
  5f07c9:	8b cf                                           	mov    ecx,edi
  5f07cb:	d3 e3                                           	shl    ebx,cl
  5f07cd:	0b c3                                           	or     eax,ebx
  5f07cf:	33 c9                                           	xor    ecx,ecx
  5f07d1:	8a 0d 00 11 ac 00                               	mov    cl,BYTE PTR ds:0xac1100
  5f07d7:	eb 41                                           	jmp    0x5f081a
  5f07d9:	66 8b 1d 9d 10 ac 00                            	mov    bx,WORD PTR ds:0xac109d
  5f07e0:	8b 15 c4 2f 85 00                               	mov    edx,DWORD PTR ds:0x852fc4
  5f07e6:	8b 35 c0 2f 85 00                               	mov    esi,DWORD PTR ds:0x852fc0
  5f07ec:	33 c0                                           	xor    eax,eax
  5f07ee:	8a c7                                           	mov    al,bh
  5f07f0:	8a ca                                           	mov    cl,dl
  5f07f2:	d3 e8                                           	shr    eax,cl
  5f07f4:	8b ce                                           	mov    ecx,esi
  5f07f6:	8b 3d c8 2f 85 00                               	mov    edi,DWORD PTR ds:0x852fc8
  5f07fc:	d3 e0                                           	shl    eax,cl
  5f07fe:	33 c9                                           	xor    ecx,ecx
  5f0800:	8a cb                                           	mov    cl,bl
  5f0802:	8b d9                                           	mov    ebx,ecx
  5f0804:	8a 0d cc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fcc
  5f080a:	d3 eb                                           	shr    ebx,cl
  5f080c:	8b cf                                           	mov    ecx,edi
  5f080e:	d3 e3                                           	shl    ebx,cl
  5f0810:	0b c3                                           	or     eax,ebx
  5f0812:	33 c9                                           	xor    ecx,ecx
  5f0814:	8a 0d 9c 10 ac 00                               	mov    cl,BYTE PTR ds:0xac109c
  5f081a:	8b 2d b8 2f 85 00                               	mov    ebp,DWORD PTR ds:0x852fb8
  5f0820:	8b d9                                           	mov    ebx,ecx
  5f0822:	8a 0d bc 2f 85 00                               	mov    cl,BYTE PTR ds:0x852fbc
  5f0828:	d3 eb                                           	shr    ebx,cl
  5f082a:	8b cd                                           	mov    ecx,ebp
  5f082c:	d3 e3                                           	shl    ebx,cl
  5f082e:	66 8b cd                                        	mov    cx,bp
  5f0831:	8b 6c 24 6c                                     	mov    ebp,DWORD PTR [esp+0x6c]
  5f0835:	0b c3                                           	or     eax,ebx
  5f0837:	8b d8                                           	mov    ebx,eax
  5f0839:	66 d3 eb                                        	shr    bx,cl
  5f083c:	8b 0d bc 2f 85 00                               	mov    ecx,DWORD PTR ds:0x852fbc
  5f0842:	d2 e3                                           	shl    bl,cl
  5f0844:	66 8b cf                                        	mov    cx,di
  5f0847:	88 5c 24 70                                     	mov    BYTE PTR [esp+0x70],bl
  5f084b:	8b d8                                           	mov    ebx,eax
  5f084d:	66 d3 eb                                        	shr    bx,cl
  5f0850:	8b 0d cc 2f 85 00                               	mov    ecx,DWORD PTR ds:0x852fcc
  5f0856:	d2 e3                                           	shl    bl,cl
  5f0858:	66 8b ce                                        	mov    cx,si
  5f085b:	8b 74 24 40                                     	mov    esi,DWORD PTR [esp+0x40]
  5f085f:	66 d3 e8                                        	shr    ax,cl
  5f0862:	8b ca                                           	mov    ecx,edx
  5f0864:	88 5c 24 71                                     	mov    BYTE PTR [esp+0x71],bl
  5f0868:	8b 5c 24 28                                     	mov    ebx,DWORD PTR [esp+0x28]
  5f086c:	d2 e0                                           	shl    al,cl
  5f086e:	88 44 24 72                                     	mov    BYTE PTR [esp+0x72],al
  5f0872:	8b 7c 24 72                                     	mov    edi,DWORD PTR [esp+0x72]
  5f0876:	8b 54 24 71                                     	mov    edx,DWORD PTR [esp+0x71]
  5f087a:	8b 44 24 70                                     	mov    eax,DWORD PTR [esp+0x70]
  5f087e:	81 e7 ff 00 00 00                               	and    edi,0xff
  5f0884:	81 e2 ff 00 00 00                               	and    edx,0xff
  5f088a:	81 cf 00 02 00 00                               	or     edi,0x200
  5f0890:	25 ff 00 00 00                                  	and    eax,0xff
  5f0895:	c1 e7 08                                        	shl    edi,0x8
  5f0898:	0b fa                                           	or     edi,edx
  5f089a:	c1 e7 08                                        	shl    edi,0x8
  5f089d:	0b f8                                           	or     edi,eax
  5f089f:	8d 94 24 90 00 00 00                            	lea    edx,[esp+0x90]
  5f08a6:	8d 8c 24 ec 00 00 00                            	lea    ecx,[esp+0xec]
  5f08ad:	e8 2e 12 10 00                                  	call   0x6f1ae0
  5f08b2:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  5f08b4:	89 8c 24 a4 00 00 00                            	mov    DWORD PTR [esp+0xa4],ecx
  5f08bb:	8b 0d 58 99 83 00                               	mov    ecx,DWORD PTR ds:0x839958
  5f08c1:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  5f08c4:	89 94 24 a8 00 00 00                            	mov    DWORD PTR [esp+0xa8],edx
  5f08cb:	8b 01                                           	mov    eax,DWORD PTR [ecx]
  5f08cd:	8d 94 24 f4 00 00 00                            	lea    edx,[esp+0xf4]
  5f08d4:	52                                              	push   edx
  5f08d5:	ff 50 78                                        	call   DWORD PTR [eax+0x78]
  5f08d8:	8b 08                                           	mov    ecx,DWORD PTR [eax]
  5f08da:	89 4c 24 48                                     	mov    DWORD PTR [esp+0x48],ecx
  5f08de:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  5f08e1:	89 54 24 4c                                     	mov    DWORD PTR [esp+0x4c],edx
  5f08e5:	8b 48 08                                        	mov    ecx,DWORD PTR [eax+0x8]
  5f08e8:	89 4c 24 50                                     	mov    DWORD PTR [esp+0x50],ecx
  5f08ec:	8b 50 0c                                        	mov    edx,DWORD PTR [eax+0xc]
  5f08ef:	85 f6                                           	test   esi,esi
  5f08f1:	89 54 24 54                                     	mov    DWORD PTR [esp+0x54],edx
  5f08f5:	0f 84 d3 03 00 00                               	je     0x5f0cce
  5f08fb:	85 db                                           	test   ebx,ebx
  5f08fd:	0f 84 cb 03 00 00                               	je     0x5f0cce
  5f0903:	33 c9                                           	xor    ecx,ecx
  5f0905:	33 c0                                           	xor    eax,eax
  5f0907:	51                                              	push   ecx
  5f0908:	50                                              	push   eax
  5f0909:	8b 54 24 1c                                     	mov    edx,DWORD PTR [esp+0x1c]
  5f090d:	51                                              	push   ecx
  5f090e:	51                                              	push   ecx
  5f090f:	68 e8 03 00 00                                  	push   0x3e8
  5f0914:	51                                              	push   ecx
  5f0915:	51                                              	push   ecx
  5f0916:	51                                              	push   ecx
  5f0917:	8d 44 24 68                                     	lea    eax,[esp+0x68]
  5f091b:	68 00 04 00 00                                  	push   0x400
  5f0920:	8d 8c 24 c8 00 00 00                            	lea    ecx,[esp+0xc8]
  5f0927:	50                                              	push   eax
  5f0928:	51                                              	push   ecx
  5f0929:	8b 0d 58 99 83 00                               	mov    ecx,DWORD PTR ds:0x839958
  5f092f:	52                                              	push   edx
  5f0930:	53                                              	push   ebx
  5f0931:	8b d6                                           	mov    edx,esi
  5f0933:	e8 68 e5 ea ff                                  	call   0x49eea0
  5f0938:	e9 91 03 00 00                                  	jmp    0x5f0cce

; 0x5f0cce <= VA < 0x5f0d59: Text draw box and selected offset(+2,+4); baseline geometry still requires font/pixel observation.
  5f0cce:	8b 45 14                                        	mov    eax,DWORD PTR [ebp+0x14]
  5f0cd1:	85 c0                                           	test   eax,eax
  5f0cd3:	0f 85 80 00 00 00                               	jne    0x5f0d59
  5f0cd9:	8b 45 28                                        	mov    eax,DWORD PTR [ebp+0x28]
  5f0cdc:	85 c0                                           	test   eax,eax
  5f0cde:	74 79                                           	je     0x5f0d59
  5f0ce0:	8b 94 24 08 01 00 00                            	mov    edx,DWORD PTR [esp+0x108]
  5f0ce7:	8d 4c 24 48                                     	lea    ecx,[esp+0x48]
  5f0ceb:	51                                              	push   ecx
  5f0cec:	52                                              	push   edx
  5f0ced:	ff 15 b8 a4 79 00                               	call   DWORD PTR ds:0x79a4b8 ; USER32.dll!GetClientRect
  5f0cf3:	8b 4c 24 34                                     	mov    ecx,DWORD PTR [esp+0x34]
  5f0cf7:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5f0cfb:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  5f0cff:	8d 51 01                                        	lea    edx,[ecx+0x1]
  5f0d02:	89 54 24 1c                                     	mov    DWORD PTR [esp+0x1c],edx
  5f0d06:	8b 54 24 38                                     	mov    edx,DWORD PTR [esp+0x38]
  5f0d0a:	8d 54 02 fe                                     	lea    edx,[edx+eax*1-0x2]
  5f0d0e:	89 54 24 20                                     	mov    DWORD PTR [esp+0x20],edx
  5f0d12:	8b 54 24 3c                                     	mov    edx,DWORD PTR [esp+0x3c]
  5f0d16:	03 d1                                           	add    edx,ecx
  5f0d18:	8a 4c 24 2c                                     	mov    cl,BYTE PTR [esp+0x2c]
  5f0d1c:	f6 c1 01                                        	test   cl,0x1
  5f0d1f:	89 54 24 24                                     	mov    DWORD PTR [esp+0x24],edx
  5f0d23:	74 12                                           	je     0x5f0d37
  5f0d25:	83 c0 02                                        	add    eax,0x2
  5f0d28:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  5f0d2c:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5f0d30:	83 c0 04                                        	add    eax,0x4
  5f0d33:	89 44 24 1c                                     	mov    DWORD PTR [esp+0x1c],eax
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

; 0x5f0da5 <= VA < 0x5f0f10: WM_TIMER toggles+c5. Custom4dc with lParam1 starts1000ms timer; disable clears+c4,+c5 and kills timer.
  5f0da5:	8a 85 c5 00 00 00                               	mov    al,BYTE PTR [ebp+0xc5]
  5f0dab:	6a 01                                           	push   0x1
  5f0dad:	84 c0                                           	test   al,al
  5f0daf:	0f 94 c0                                        	sete   al
  5f0db2:	88 85 c5 00 00 00                               	mov    BYTE PTR [ebp+0xc5],al
  5f0db8:	8b 8c 24 0c 01 00 00                            	mov    ecx,DWORD PTR [esp+0x10c]
  5f0dbf:	6a 00                                           	push   0x0
  5f0dc1:	51                                              	push   ecx
  5f0dc2:	ff 15 94 a4 79 00                               	call   DWORD PTR ds:0x79a494 ; USER32.dll!InvalidateRect
  5f0dc8:	e9 0f 01 00 00                                  	jmp    0x5f0edc
  5f0dcd:	8b c3                                           	mov    eax,ebx
  5f0dcf:	2d 01 02 00 00                                  	sub    eax,0x201
  5f0dd4:	0f 84 d7 00 00 00                               	je     0x5f0eb1
  5f0dda:	83 e8 02                                        	sub    eax,0x2
  5f0ddd:	0f 84 ce 00 00 00                               	je     0x5f0eb1
  5f0de3:	2d d9 02 00 00                                  	sub    eax,0x2d9
  5f0de8:	0f 85 ee 00 00 00                               	jne    0x5f0edc
  5f0dee:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5f0df3:	85 c0                                           	test   eax,eax
  5f0df5:	74 47                                           	je     0x5f0e3e
  5f0df7:	8d 8c 24 08 01 00 00                            	lea    ecx,[esp+0x108]
  5f0dfe:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5f0e04:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5f0e0a:	ba 01 00 00 00                                  	mov    edx,0x1
  5f0e0f:	d3 e2                                           	shl    edx,cl
  5f0e11:	4a                                              	dec    edx
  5f0e12:	23 d0                                           	and    edx,eax
  5f0e14:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5f0e19:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5f0e1c:	85 c0                                           	test   eax,eax
  5f0e1e:	74 1e                                           	je     0x5f0e3e
  5f0e20:	8b 8c 24 08 01 00 00                            	mov    ecx,DWORD PTR [esp+0x108]
  5f0e27:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5f0e29:	74 0c                                           	je     0x5f0e37
  5f0e2b:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5f0e31:	85 c0                                           	test   eax,eax
  5f0e33:	75 f2                                           	jne    0x5f0e27
  5f0e35:	eb 07                                           	jmp    0x5f0e3e
  5f0e37:	85 c0                                           	test   eax,eax
  5f0e39:	74 03                                           	je     0x5f0e3e
  5f0e3b:	8d 68 04                                        	lea    ebp,[eax+0x4]
  5f0e3e:	83 bc 24 14 01 00 00 01                         	cmp    DWORD PTR [esp+0x114],0x1
  5f0e46:	0f 94 c0                                        	sete   al
  5f0e49:	84 c0                                           	test   al,al
  5f0e4b:	8a 85 c4 00 00 00                               	mov    al,BYTE PTR [ebp+0xc4]
  5f0e51:	74 28                                           	je     0x5f0e7b
  5f0e53:	84 c0                                           	test   al,al
  5f0e55:	0f 85 81 00 00 00                               	jne    0x5f0edc
  5f0e5b:	c6 85 c4 00 00 00 01                            	mov    BYTE PTR [ebp+0xc4],0x1
  5f0e62:	8b 8c 24 08 01 00 00                            	mov    ecx,DWORD PTR [esp+0x108]
  5f0e69:	6a 00                                           	push   0x0
  5f0e6b:	68 e8 03 00 00                                  	push   0x3e8
  5f0e70:	6a 00                                           	push   0x0
  5f0e72:	51                                              	push   ecx
  5f0e73:	ff 15 d4 a4 79 00                               	call   DWORD PTR ds:0x79a4d4 ; USER32.dll!SetTimer
  5f0e79:	eb 61                                           	jmp    0x5f0edc
  5f0e7b:	84 c0                                           	test   al,al
  5f0e7d:	74 5d                                           	je     0x5f0edc
  5f0e7f:	c6 85 c4 00 00 00 00                            	mov    BYTE PTR [ebp+0xc4],0x0
  5f0e86:	c6 85 c5 00 00 00 00                            	mov    BYTE PTR [ebp+0xc5],0x0
  5f0e8d:	8b 94 24 08 01 00 00                            	mov    edx,DWORD PTR [esp+0x108]
  5f0e94:	6a 00                                           	push   0x0
  5f0e96:	52                                              	push   edx
  5f0e97:	ff 15 c4 a4 79 00                               	call   DWORD PTR ds:0x79a4c4 ; USER32.dll!KillTimer
  5f0e9d:	6a 01                                           	push   0x1
  5f0e9f:	6a 00                                           	push   0x0
  5f0ea1:	8b 84 24 10 01 00 00                            	mov    eax,DWORD PTR [esp+0x110]
  5f0ea8:	50                                              	push   eax
  5f0ea9:	ff 15 94 a4 79 00                               	call   DWORD PTR ds:0x79a494 ; USER32.dll!InvalidateRect
  5f0eaf:	eb 2b                                           	jmp    0x5f0edc
  5f0eb1:	8a 85 bc 00 00 00                               	mov    al,BYTE PTR [ebp+0xbc]
  5f0eb7:	84 c0                                           	test   al,al
  5f0eb9:	0f 85 d7 fe ff ff                               	jne    0x5f0d96
  5f0ebf:	8b 0d 48 98 83 00                               	mov    ecx,DWORD PTR ds:0x839848
  5f0ec5:	6a 00                                           	push   0x0
  5f0ec7:	ba 00 20 00 00                                  	mov    edx,0x2000
  5f0ecc:	68 00 00 80 3f                                  	push   0x3f800000
  5f0ed1:	8b 89 80 01 00 00                               	mov    ecx,DWORD PTR [ecx+0x180]
  5f0ed7:	e8 d4 2e 12 00                                  	call   0x713db0
  5f0edc:	8b 94 24 14 01 00 00                            	mov    edx,DWORD PTR [esp+0x114]
  5f0ee3:	8b 84 24 10 01 00 00                            	mov    eax,DWORD PTR [esp+0x110]
  5f0eea:	8b 8c 24 08 01 00 00                            	mov    ecx,DWORD PTR [esp+0x108]
  5f0ef1:	52                                              	push   edx
  5f0ef2:	8b 54 24 18                                     	mov    edx,DWORD PTR [esp+0x18]
  5f0ef6:	50                                              	push   eax
  5f0ef7:	53                                              	push   ebx
  5f0ef8:	51                                              	push   ecx
  5f0ef9:	52                                              	push   edx
  5f0efa:	ff 15 c0 a4 79 00                               	call   DWORD PTR ds:0x79a4c0 ; USER32.dll!CallWindowProcA
  5f0f00:	5f                                              	pop    edi
  5f0f01:	5e                                              	pop    esi
  5f0f02:	5d                                              	pop    ebp
  5f0f03:	5b                                              	pop    ebx
  5f0f04:	81 c4 f4 00 00 00                               	add    esp,0xf4
  5f0f0a:	c2 10 00                                        	ret    0x10
  5f0f0d:	8d 49 00                                        	lea    ecx,[ecx+0x0]
