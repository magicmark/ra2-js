; READ-ONLY STATIC EVIDENCE. The supplied base-RA2 executable is modified (.detour, xwis.dll).
; Not a clean-retail screenshot, execution trace, or certification.
; Input SHA256: 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; Generated with objdump -d -Mintel --insn-width=16 and explicit VA ranges.

; 0x5e6450 <= VA < 0x5e6860: Explicit rectangle override predicate. No resources181,184,3003 in this function.
  5e6450:	83 ec 08                                        	sub    esp,0x8
  5e6453:	56                                              	push   esi
  5e6454:	89 4c 24 08                                     	mov    DWORD PTR [esp+0x8],ecx
  5e6458:	8d 44 24 04                                     	lea    eax,[esp+0x4]
  5e645c:	57                                              	push   edi
  5e645d:	8d 4c 24 0c                                     	lea    ecx,[esp+0xc]
  5e6461:	50                                              	push   eax
  5e6462:	51                                              	push   ecx
  5e6463:	8b fa                                           	mov    edi,edx
  5e6465:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e646a:	c7 44 24 10 00 00 00 00                         	mov    DWORD PTR [esp+0x10],0x0
  5e6472:	e8 99 b2 01 00                                  	call   0x601710
  5e6477:	8b 44 24 08                                     	mov    eax,DWORD PTR [esp+0x8]
  5e647b:	85 c0                                           	test   eax,eax
  5e647d:	74 05                                           	je     0x5e6484
  5e647f:	8b 70 6c                                        	mov    esi,DWORD PTR [eax+0x6c]
  5e6482:	eb 02                                           	jmp    0x5e6486
  5e6484:	33 f6                                           	xor    esi,esi
  5e6486:	57                                              	push   edi
  5e6487:	ff 15 f4 a3 79 00                               	call   DWORD PTR ds:0x79a3f4 ; USER32.dll!GetDlgCtrlID
  5e648d:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e6493:	0f 85 56 01 00 00                               	jne    0x5e65ef
  5e6499:	8b 15 e0 23 85 00                               	mov    edx,DWORD PTR ds:0x8523e0
  5e649f:	8b 0d 6c dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add6c
  5e64a5:	3b d1                                           	cmp    edx,ecx
  5e64a7:	0f 8c 9c 03 00 00                               	jl     0x5e6849
  5e64ad:	3d ea 06 00 00                                  	cmp    eax,0x6ea
  5e64b2:	75 32                                           	jne    0x5e64e6
  5e64b4:	6a 10                                           	push   0x10
  5e64b6:	e8 5c bb 19 00                                  	call   0x782017
  5e64bb:	83 c4 04                                        	add    esp,0x4
  5e64be:	85 c0                                           	test   eax,eax
  5e64c0:	0f 84 83 03 00 00                               	je     0x5e6849
  5e64c6:	c7 00 1e 00 00 00                               	mov    DWORD PTR [eax],0x1e
  5e64cc:	c7 40 04 1a 00 00 00                            	mov    DWORD PTR [eax+0x4],0x1a
  5e64d3:	c7 40 08 3a 02 00 00                            	mov    DWORD PTR [eax+0x8],0x23a
  5e64da:	c7 40 0c 87 00 00 00                            	mov    DWORD PTR [eax+0xc],0x87
  5e64e1:	e9 30 03 00 00                                  	jmp    0x5e6816
  5e64e6:	3d eb 06 00 00                                  	cmp    eax,0x6eb
  5e64eb:	75 32                                           	jne    0x5e651f
  5e64ed:	6a 10                                           	push   0x10
  5e64ef:	e8 23 bb 19 00                                  	call   0x782017
  5e64f4:	83 c4 04                                        	add    esp,0x4
  5e64f7:	85 c0                                           	test   eax,eax
  5e64f9:	0f 84 4a 03 00 00                               	je     0x5e6849
  5e64ff:	c7 00 52 00 00 00                               	mov    DWORD PTR [eax],0x52
  5e6505:	c7 40 04 bb 00 00 00                            	mov    DWORD PTR [eax+0x4],0xbb
  5e650c:	c7 40 08 d4 01 00 00                            	mov    DWORD PTR [eax+0x8],0x1d4
  5e6513:	c7 40 0c 6c 00 00 00                            	mov    DWORD PTR [eax+0xc],0x6c
  5e651a:	e9 f7 02 00 00                                  	jmp    0x5e6816
  5e651f:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e6524:	75 32                                           	jne    0x5e6558
  5e6526:	6a 10                                           	push   0x10
  5e6528:	e8 ea ba 19 00                                  	call   0x782017
  5e652d:	83 c4 04                                        	add    esp,0x4
  5e6530:	85 c0                                           	test   eax,eax
  5e6532:	0f 84 11 03 00 00                               	je     0x5e6849
  5e6538:	c7 00 62 00 00 00                               	mov    DWORD PTR [eax],0x62
  5e653e:	c7 40 04 2a 01 00 00                            	mov    DWORD PTR [eax+0x4],0x12a
  5e6545:	c7 40 08 bc 01 00 00                            	mov    DWORD PTR [eax+0x8],0x1bc
  5e654c:	c7 40 0c 95 00 00 00                            	mov    DWORD PTR [eax+0xc],0x95
  5e6553:	e9 be 02 00 00                                  	jmp    0x5e6816
  5e6558:	3d 0f 05 00 00                                  	cmp    eax,0x50f
  5e655d:	75 32                                           	jne    0x5e6591
  5e655f:	6a 10                                           	push   0x10
  5e6561:	e8 b1 ba 19 00                                  	call   0x782017
  5e6566:	83 c4 04                                        	add    esp,0x4
  5e6569:	85 c0                                           	test   eax,eax
  5e656b:	0f 84 d8 02 00 00                               	je     0x5e6849
  5e6571:	c7 00 b1 00 00 00                               	mov    DWORD PTR [eax],0xb1
  5e6577:	c7 40 04 fd 01 00 00                            	mov    DWORD PTR [eax+0x4],0x1fd
  5e657e:	c7 40 08 10 01 00 00                            	mov    DWORD PTR [eax+0x8],0x110
  5e6585:	c7 40 0c 15 00 00 00                            	mov    DWORD PTR [eax+0xc],0x15
  5e658c:	e9 85 02 00 00                                  	jmp    0x5e6816
  5e6591:	3d 1e 07 00 00                                  	cmp    eax,0x71e
  5e6596:	75 1a                                           	jne    0x5e65b2
  5e6598:	6a 10                                           	push   0x10
  5e659a:	e8 78 ba 19 00                                  	call   0x782017
  5e659f:	83 c4 04                                        	add    esp,0x4
  5e65a2:	85 c0                                           	test   eax,eax
  5e65a4:	0f 84 9f 02 00 00                               	je     0x5e6849
  5e65aa:	c7 00 b1 00 00 00                               	mov    DWORD PTR [eax],0xb1
  5e65b0:	eb 23                                           	jmp    0x5e65d5
  5e65b2:	3d 70 06 00 00                                  	cmp    eax,0x670
  5e65b7:	0f 85 8c 02 00 00                               	jne    0x5e6849
  5e65bd:	6a 10                                           	push   0x10
  5e65bf:	e8 53 ba 19 00                                  	call   0x782017
  5e65c4:	83 c4 04                                        	add    esp,0x4
  5e65c7:	85 c0                                           	test   eax,eax
  5e65c9:	0f 84 7a 02 00 00                               	je     0x5e6849
  5e65cf:	c7 00 35 01 00 00                               	mov    DWORD PTR [eax],0x135
  5e65d5:	c7 40 04 dc 01 00 00                            	mov    DWORD PTR [eax+0x4],0x1dc
  5e65dc:	c7 40 08 8d 00 00 00                            	mov    DWORD PTR [eax+0x8],0x8d
  5e65e3:	c7 40 0c 14 00 00 00                            	mov    DWORD PTR [eax+0xc],0x14
  5e65ea:	e9 27 02 00 00                                  	jmp    0x5e6816
  5e65ef:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e65f5:	75 5f                                           	jne    0x5e6656
  5e65f7:	3d 2b 07 00 00                                  	cmp    eax,0x72b
  5e65fc:	0f 85 47 02 00 00                               	jne    0x5e6849
  5e6602:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e6607:	8b 0d 6c dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add6c
  5e660d:	3b c1                                           	cmp    eax,ecx
  5e660f:	7c 2d                                           	jl     0x5e663e
  5e6611:	8b 0d 90 d2 a3 00                               	mov    ecx,DWORD PTR ds:0xa3d290
  5e6617:	6a 10                                           	push   0x10
  5e6619:	8a 81 39 22 00 00                               	mov    al,BYTE PTR [ecx+0x2239]
  5e661f:	84 c0                                           	test   al,al
  5e6621:	75 6b                                           	jne    0x5e668e
  5e6623:	e8 ef b9 19 00                                  	call   0x782017
  5e6628:	83 c4 04                                        	add    esp,0x4
  5e662b:	85 c0                                           	test   eax,eax
  5e662d:	0f 84 16 02 00 00                               	je     0x5e6849
  5e6633:	c7 00 67 00 00 00                               	mov    DWORD PTR [eax],0x67
  5e6639:	e9 c0 00 00 00                                  	jmp    0x5e66fe
  5e663e:	8b 15 90 d2 a3 00                               	mov    edx,DWORD PTR ds:0xa3d290
  5e6644:	6a 10                                           	push   0x10
  5e6646:	8a 82 39 22 00 00                               	mov    al,BYTE PTR [edx+0x2239]
  5e664c:	84 c0                                           	test   al,al
  5e664e:	0f 84 94 00 00 00                               	je     0x5e66e8
  5e6654:	eb 7a                                           	jmp    0x5e66d0
  5e6656:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e665c:	0f 85 b6 00 00 00                               	jne    0x5e6718
  5e6662:	3d 2b 07 00 00                                  	cmp    eax,0x72b
  5e6667:	0f 85 dc 01 00 00                               	jne    0x5e6849
  5e666d:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e6672:	8b 0d 6c dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add6c
  5e6678:	3b c1                                           	cmp    eax,ecx
  5e667a:	7c 42                                           	jl     0x5e66be
  5e667c:	8b 0d 90 d2 a3 00                               	mov    ecx,DWORD PTR ds:0xa3d290
  5e6682:	6a 10                                           	push   0x10
  5e6684:	8a 81 39 22 00 00                               	mov    al,BYTE PTR [ecx+0x2239]
  5e668a:	84 c0                                           	test   al,al
  5e668c:	74 95                                           	je     0x5e6623
  5e668e:	e8 84 b9 19 00                                  	call   0x782017
  5e6693:	83 c4 04                                        	add    esp,0x4
  5e6696:	85 c0                                           	test   eax,eax
  5e6698:	0f 84 ab 01 00 00                               	je     0x5e6849
  5e669e:	c7 00 68 00 00 00                               	mov    DWORD PTR [eax],0x68
  5e66a4:	c7 40 04 8e 00 00 00                            	mov    DWORD PTR [eax+0x4],0x8e
  5e66ab:	c7 40 08 a8 01 00 00                            	mov    DWORD PTR [eax+0x8],0x1a8
  5e66b2:	c7 40 0c dc 00 00 00                            	mov    DWORD PTR [eax+0xc],0xdc
  5e66b9:	e9 58 01 00 00                                  	jmp    0x5e6816
  5e66be:	8b 15 90 d2 a3 00                               	mov    edx,DWORD PTR ds:0xa3d290
  5e66c4:	6a 10                                           	push   0x10
  5e66c6:	8a 82 39 22 00 00                               	mov    al,BYTE PTR [edx+0x2239]
  5e66cc:	84 c0                                           	test   al,al
  5e66ce:	74 18                                           	je     0x5e66e8
  5e66d0:	e8 42 b9 19 00                                  	call   0x782017
  5e66d5:	83 c4 04                                        	add    esp,0x4
  5e66d8:	85 c0                                           	test   eax,eax
  5e66da:	0f 84 69 01 00 00                               	je     0x5e6849
  5e66e0:	c7 00 18 00 00 00                               	mov    DWORD PTR [eax],0x18
  5e66e6:	eb bc                                           	jmp    0x5e66a4
  5e66e8:	e8 2a b9 19 00                                  	call   0x782017
  5e66ed:	83 c4 04                                        	add    esp,0x4
  5e66f0:	85 c0                                           	test   eax,eax
  5e66f2:	0f 84 51 01 00 00                               	je     0x5e6849
  5e66f8:	c7 00 17 00 00 00                               	mov    DWORD PTR [eax],0x17
  5e66fe:	c7 40 04 82 00 00 00                            	mov    DWORD PTR [eax+0x4],0x82
  5e6705:	c7 40 08 a8 01 00 00                            	mov    DWORD PTR [eax+0x8],0x1a8
  5e670c:	c7 40 0c e6 00 00 00                            	mov    DWORD PTR [eax+0xc],0xe6
  5e6713:	e9 fe 00 00 00                                  	jmp    0x5e6816
  5e6718:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e671e:	75 28                                           	jne    0x5e6748
  5e6720:	3d 2f 07 00 00                                  	cmp    eax,0x72f
  5e6725:	0f 85 1e 01 00 00                               	jne    0x5e6849
  5e672b:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e6730:	8b 0d 68 dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add68
  5e6736:	3b c1                                           	cmp    eax,ecx
  5e6738:	0f 84 82 00 00 00                               	je     0x5e67c0
  5e673e:	3b 05 6c dd 7a 00                               	cmp    eax,DWORD PTR ds:0x7add6c
  5e6744:	74 40                                           	je     0x5e6786
  5e6746:	eb 32                                           	jmp    0x5e677a
  5e6748:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e674e:	74 d0                                           	je     0x5e6720
  5e6750:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e6756:	75 42                                           	jne    0x5e679a
  5e6758:	3d 2f 07 00 00                                  	cmp    eax,0x72f
  5e675d:	0f 85 e6 00 00 00                               	jne    0x5e6849
  5e6763:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e6768:	8b 0d 68 dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add68
  5e676e:	3b c1                                           	cmp    eax,ecx
  5e6770:	74 4e                                           	je     0x5e67c0
  5e6772:	3b 05 6c dd 7a 00                               	cmp    eax,DWORD PTR ds:0x7add6c
  5e6778:	74 0c                                           	je     0x5e6786
  5e677a:	3b 05 70 dd 7a 00                               	cmp    eax,DWORD PTR ds:0x7add70
  5e6780:	0f 85 c3 00 00 00                               	jne    0x5e6849
  5e6786:	6a 10                                           	push   0x10
  5e6788:	e8 8a b8 19 00                                  	call   0x782017
  5e678d:	83 c4 04                                        	add    esp,0x4
  5e6790:	85 c0                                           	test   eax,eax
  5e6792:	0f 84 b1 00 00 00                               	je     0x5e6849
  5e6798:	eb 61                                           	jmp    0x5e67fb
  5e679a:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e67a0:	0f 85 a3 00 00 00                               	jne    0x5e6849
  5e67a6:	3d 2f 07 00 00                                  	cmp    eax,0x72f
  5e67ab:	0f 85 98 00 00 00                               	jne    0x5e6849
  5e67b1:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e67b6:	8b 0d 68 dd 7a 00                               	mov    ecx,DWORD PTR ds:0x7add68
  5e67bc:	3b c1                                           	cmp    eax,ecx
  5e67be:	75 1d                                           	jne    0x5e67dd
  5e67c0:	6a 10                                           	push   0x10
  5e67c2:	e8 50 b8 19 00                                  	call   0x782017
  5e67c7:	83 c4 04                                        	add    esp,0x4
  5e67ca:	85 c0                                           	test   eax,eax
  5e67cc:	74 7b                                           	je     0x5e6849
  5e67ce:	c7 00 34 00 00 00                               	mov    DWORD PTR [eax],0x34
  5e67d4:	c7 40 04 4e 00 00 00                            	mov    DWORD PTR [eax+0x4],0x4e
  5e67db:	eb 2b                                           	jmp    0x5e6808
  5e67dd:	3b 05 6c dd 7a 00                               	cmp    eax,DWORD PTR ds:0x7add6c
  5e67e3:	74 08                                           	je     0x5e67ed
  5e67e5:	3b 05 70 dd 7a 00                               	cmp    eax,DWORD PTR ds:0x7add70
  5e67eb:	75 5c                                           	jne    0x5e6849
  5e67ed:	6a 10                                           	push   0x10
  5e67ef:	e8 23 b8 19 00                                  	call   0x782017
  5e67f4:	83 c4 04                                        	add    esp,0x4
  5e67f7:	85 c0                                           	test   eax,eax
  5e67f9:	74 4e                                           	je     0x5e6849
  5e67fb:	c7 00 84 00 00 00                               	mov    DWORD PTR [eax],0x84
  5e6801:	c7 40 04 8a 00 00 00                            	mov    DWORD PTR [eax+0x4],0x8a
  5e6808:	c7 40 08 8c 01 00 00                            	mov    DWORD PTR [eax+0x8],0x18c
  5e680f:	c7 40 0c 8f 00 00 00                            	mov    DWORD PTR [eax+0xc],0x8f
  5e6816:	85 c0                                           	test   eax,eax
  5e6818:	74 2f                                           	je     0x5e6849
  5e681a:	8b 54 24 14                                     	mov    edx,DWORD PTR [esp+0x14]
  5e681e:	8b c8                                           	mov    ecx,eax
  5e6820:	50                                              	push   eax
  5e6821:	8b 31                                           	mov    esi,DWORD PTR [ecx]
  5e6823:	89 32                                           	mov    DWORD PTR [edx],esi
  5e6825:	8b 71 04                                        	mov    esi,DWORD PTR [ecx+0x4]
  5e6828:	89 72 04                                        	mov    DWORD PTR [edx+0x4],esi
  5e682b:	8b 71 08                                        	mov    esi,DWORD PTR [ecx+0x8]
  5e682e:	89 72 08                                        	mov    DWORD PTR [edx+0x8],esi
  5e6831:	8b 49 0c                                        	mov    ecx,DWORD PTR [ecx+0xc]
  5e6834:	89 4a 0c                                        	mov    DWORD PTR [edx+0xc],ecx
  5e6837:	e8 ff b4 19 00                                  	call   0x781d3b
  5e683c:	83 c4 04                                        	add    esp,0x4
  5e683f:	b0 01                                           	mov    al,0x1
  5e6841:	5f                                              	pop    edi
  5e6842:	5e                                              	pop    esi
  5e6843:	83 c4 08                                        	add    esp,0x8
  5e6846:	c2 04 00                                        	ret    0x4
  5e6849:	5f                                              	pop    edi
  5e684a:	32 c0                                           	xor    al,al
  5e684c:	5e                                              	pop    esi
  5e684d:	83 c4 08                                        	add    esp,0x8
  5e6850:	c2 04 00                                        	ret    0x4
  5e6853:	90                                              	nop
  5e6854:	90                                              	nop
  5e6855:	90                                              	nop
  5e6856:	90                                              	nop
  5e6857:	90                                              	nop
  5e6858:	90                                              	nop
  5e6859:	90                                              	nop
  5e685a:	90                                              	nop
  5e685b:	90                                              	nop
  5e685c:	90                                              	nop
  5e685d:	90                                              	nop
  5e685e:	90                                              	nop
  5e685f:	90                                              	nop

; 0x5e6860 <= VA < 0x5e72c0: Right-column predicate: title1684; resource181 action IDs1310..1314; resource3003 IDs1324,1325.
  5e6860:	51                                              	push   ecx
  5e6861:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e6866:	56                                              	push   esi
  5e6867:	57                                              	push   edi
  5e6868:	8b fa                                           	mov    edi,edx
  5e686a:	85 c0                                           	test   eax,eax
  5e686c:	89 4c 24 08                                     	mov    DWORD PTR [esp+0x8],ecx
  5e6870:	74 3c                                           	je     0x5e68ae
  5e6872:	8d 4c 24 08                                     	lea    ecx,[esp+0x8]
  5e6876:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e687c:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e6882:	ba 01 00 00 00                                  	mov    edx,0x1
  5e6887:	d3 e2                                           	shl    edx,cl
  5e6889:	4a                                              	dec    edx
  5e688a:	23 d0                                           	and    edx,eax
  5e688c:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e6891:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e6894:	85 c0                                           	test   eax,eax
  5e6896:	74 16                                           	je     0x5e68ae
  5e6898:	8b 4c 24 08                                     	mov    ecx,DWORD PTR [esp+0x8]
  5e689c:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e689e:	0f 84 1a 02 00 00                               	je     0x5e6abe
  5e68a4:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e68aa:	85 c0                                           	test   eax,eax
  5e68ac:	75 ee                                           	jne    0x5e689c
  5e68ae:	33 f6                                           	xor    esi,esi
  5e68b0:	57                                              	push   edi
  5e68b1:	ff 15 f4 a3 79 00                               	call   DWORD PTR ds:0x79a3f4 ; USER32.dll!GetDlgCtrlID
  5e68b7:	81 fe 0c 01 00 00                               	cmp    esi,0x10c
  5e68bd:	0f 84 ee 01 00 00                               	je     0x5e6ab1
  5e68c3:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e68c9:	0f 84 e2 01 00 00                               	je     0x5e6ab1
  5e68cf:	81 fe a3 00 00 00                               	cmp    esi,0xa3
  5e68d5:	0f 84 d6 01 00 00                               	je     0x5e6ab1
  5e68db:	83 fe 73                                        	cmp    esi,0x73
  5e68de:	0f 84 cd 01 00 00                               	je     0x5e6ab1
  5e68e4:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e68ea:	0f 84 c1 01 00 00                               	je     0x5e6ab1
  5e68f0:	81 fe bb 0b 00 00                               	cmp    esi,0xbbb
  5e68f6:	0f 84 b5 01 00 00                               	je     0x5e6ab1
  5e68fc:	81 fe f5 00 00 00                               	cmp    esi,0xf5
  5e6902:	0f 84 a9 01 00 00                               	je     0x5e6ab1
  5e6908:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e690e:	0f 84 9d 01 00 00                               	je     0x5e6ab1
  5e6914:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e691a:	0f 84 91 01 00 00                               	je     0x5e6ab1
  5e6920:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e6926:	0f 84 85 01 00 00                               	je     0x5e6ab1
  5e692c:	81 fe b5 02 00 00                               	cmp    esi,0x2b5
  5e6932:	0f 84 79 01 00 00                               	je     0x5e6ab1
  5e6938:	81 fe b7 00 00 00                               	cmp    esi,0xb7
  5e693e:	0f 84 6d 01 00 00                               	je     0x5e6ab1
  5e6944:	81 fe b4 02 00 00                               	cmp    esi,0x2b4
  5e694a:	0f 84 61 01 00 00                               	je     0x5e6ab1
  5e6950:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e6956:	0f 84 55 01 00 00                               	je     0x5e6ab1
  5e695c:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e6962:	0f 84 49 01 00 00                               	je     0x5e6ab1
  5e6968:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e696e:	0f 84 3d 01 00 00                               	je     0x5e6ab1
  5e6974:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e697a:	0f 84 31 01 00 00                               	je     0x5e6ab1
  5e6980:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e6986:	0f 84 25 01 00 00                               	je     0x5e6ab1
  5e698c:	81 fe 08 01 00 00                               	cmp    esi,0x108
  5e6992:	0f 84 19 01 00 00                               	je     0x5e6ab1
  5e6998:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e699e:	0f 84 0d 01 00 00                               	je     0x5e6ab1
  5e69a4:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e69aa:	0f 84 01 01 00 00                               	je     0x5e6ab1
  5e69b0:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e69b6:	0f 84 f5 00 00 00                               	je     0x5e6ab1
  5e69bc:	81 fe b5 00 00 00                               	cmp    esi,0xb5
  5e69c2:	0f 84 e9 00 00 00                               	je     0x5e6ab1
  5e69c8:	81 fe ba 0b 00 00                               	cmp    esi,0xbba
  5e69ce:	0f 84 dd 00 00 00                               	je     0x5e6ab1
  5e69d4:	81 fe ff 00 00 00                               	cmp    esi,0xff
  5e69da:	0f 84 d1 00 00 00                               	je     0x5e6ab1
  5e69e0:	83 fe 6b                                        	cmp    esi,0x6b
  5e69e3:	0f 84 c8 00 00 00                               	je     0x5e6ab1
  5e69e9:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e69ef:	0f 84 bc 00 00 00                               	je     0x5e6ab1
  5e69f5:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e69fb:	0f 84 b0 00 00 00                               	je     0x5e6ab1
  5e6a01:	81 fe b8 00 00 00                               	cmp    esi,0xb8
  5e6a07:	0f 84 a4 00 00 00                               	je     0x5e6ab1
  5e6a0d:	81 fe d6 00 00 00                               	cmp    esi,0xd6
  5e6a13:	0f 84 98 00 00 00                               	je     0x5e6ab1
  5e6a19:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e6a1f:	0f 84 8c 00 00 00                               	je     0x5e6ab1
  5e6a25:	81 fe 25 01 00 00                               	cmp    esi,0x125
  5e6a2b:	0f 84 80 00 00 00                               	je     0x5e6ab1
  5e6a31:	81 fe e7 00 00 00                               	cmp    esi,0xe7
  5e6a37:	74 78                                           	je     0x5e6ab1
  5e6a39:	81 fe 16 01 00 00                               	cmp    esi,0x116
  5e6a3f:	74 70                                           	je     0x5e6ab1
  5e6a41:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e6a47:	74 68                                           	je     0x5e6ab1
  5e6a49:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e6a4f:	74 60                                           	je     0x5e6ab1
  5e6a51:	81 fe 1d 01 00 00                               	cmp    esi,0x11d
  5e6a57:	74 58                                           	je     0x5e6ab1
  5e6a59:	81 fe 1c 01 00 00                               	cmp    esi,0x11c
  5e6a5f:	74 50                                           	je     0x5e6ab1
  5e6a61:	81 fe 14 01 00 00                               	cmp    esi,0x114
  5e6a67:	74 48                                           	je     0x5e6ab1
  5e6a69:	81 fe bc 02 00 00                               	cmp    esi,0x2bc
  5e6a6f:	74 40                                           	je     0x5e6ab1
  5e6a71:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e6a77:	74 38                                           	je     0x5e6ab1
  5e6a79:	81 fe 09 01 00 00                               	cmp    esi,0x109
  5e6a7f:	74 30                                           	je     0x5e6ab1
  5e6a81:	81 fe 0f 01 00 00                               	cmp    esi,0x10f
  5e6a87:	74 28                                           	je     0x5e6ab1
  5e6a89:	81 fe 17 01 00 00                               	cmp    esi,0x117
  5e6a8f:	74 20                                           	je     0x5e6ab1
  5e6a91:	81 fe e6 00 00 00                               	cmp    esi,0xe6
  5e6a97:	74 18                                           	je     0x5e6ab1
  5e6a99:	81 fe f3 00 00 00                               	cmp    esi,0xf3
  5e6a9f:	74 10                                           	je     0x5e6ab1
  5e6aa1:	81 fe f4 00 00 00                               	cmp    esi,0xf4
  5e6aa7:	74 08                                           	je     0x5e6ab1
  5e6aa9:	81 fe 0e 01 00 00                               	cmp    esi,0x10e
  5e6aaf:	75 28                                           	jne    0x5e6ad9
  5e6ab1:	3d 94 06 00 00                                  	cmp    eax,0x694
  5e6ab6:	75 21                                           	jne    0x5e6ad9
  5e6ab8:	5f                                              	pop    edi
  5e6ab9:	b0 01                                           	mov    al,0x1
  5e6abb:	5e                                              	pop    esi
  5e6abc:	59                                              	pop    ecx
  5e6abd:	c3                                              	ret
  5e6abe:	85 c0                                           	test   eax,eax
  5e6ac0:	0f 84 e8 fd ff ff                               	je     0x5e68ae
  5e6ac6:	83 c0 04                                        	add    eax,0x4
  5e6ac9:	85 c0                                           	test   eax,eax
  5e6acb:	0f 84 dd fd ff ff                               	je     0x5e68ae
  5e6ad1:	8b 70 6c                                        	mov    esi,DWORD PTR [eax+0x6c]
  5e6ad4:	e9 d7 fd ff ff                                  	jmp    0x5e68b0
  5e6ad9:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e6adf:	0f 84 10 01 00 00                               	je     0x5e6bf5
  5e6ae5:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e6aeb:	0f 84 04 01 00 00                               	je     0x5e6bf5
  5e6af1:	81 fe f5 00 00 00                               	cmp    esi,0xf5
  5e6af7:	0f 84 f8 00 00 00                               	je     0x5e6bf5
  5e6afd:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e6b03:	0f 84 ec 00 00 00                               	je     0x5e6bf5
  5e6b09:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e6b0f:	0f 84 e0 00 00 00                               	je     0x5e6bf5
  5e6b15:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e6b1b:	0f 84 d4 00 00 00                               	je     0x5e6bf5
  5e6b21:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e6b27:	0f 84 c8 00 00 00                               	je     0x5e6bf5
  5e6b2d:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e6b33:	0f 84 bc 00 00 00                               	je     0x5e6bf5
  5e6b39:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e6b3f:	0f 84 b0 00 00 00                               	je     0x5e6bf5
  5e6b45:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e6b4b:	0f 84 a4 00 00 00                               	je     0x5e6bf5
  5e6b51:	81 fe d6 00 00 00                               	cmp    esi,0xd6
  5e6b57:	0f 84 98 00 00 00                               	je     0x5e6bf5
  5e6b5d:	81 fe 25 01 00 00                               	cmp    esi,0x125
  5e6b63:	0f 84 8c 00 00 00                               	je     0x5e6bf5
  5e6b69:	81 fe 22 01 00 00                               	cmp    esi,0x122
  5e6b6f:	0f 84 80 00 00 00                               	je     0x5e6bf5
  5e6b75:	81 fe 12 01 00 00                               	cmp    esi,0x112
  5e6b7b:	74 78                                           	je     0x5e6bf5
  5e6b7d:	81 fe e7 00 00 00                               	cmp    esi,0xe7
  5e6b83:	74 70                                           	je     0x5e6bf5
  5e6b85:	81 fe 16 01 00 00                               	cmp    esi,0x116
  5e6b8b:	74 68                                           	je     0x5e6bf5
  5e6b8d:	81 fe 1d 01 00 00                               	cmp    esi,0x11d
  5e6b93:	74 60                                           	je     0x5e6bf5
  5e6b95:	81 fe 1c 01 00 00                               	cmp    esi,0x11c
  5e6b9b:	74 58                                           	je     0x5e6bf5
  5e6b9d:	81 fe fe 00 00 00                               	cmp    esi,0xfe
  5e6ba3:	74 50                                           	je     0x5e6bf5
  5e6ba5:	81 fe 0f 01 00 00                               	cmp    esi,0x10f
  5e6bab:	74 48                                           	je     0x5e6bf5
  5e6bad:	81 fe 17 01 00 00                               	cmp    esi,0x117
  5e6bb3:	74 40                                           	je     0x5e6bf5
  5e6bb5:	81 fe 14 01 00 00                               	cmp    esi,0x114
  5e6bbb:	74 38                                           	je     0x5e6bf5
  5e6bbd:	81 fe e6 00 00 00                               	cmp    esi,0xe6
  5e6bc3:	74 30                                           	je     0x5e6bf5
  5e6bc5:	81 fe f3 00 00 00                               	cmp    esi,0xf3
  5e6bcb:	74 28                                           	je     0x5e6bf5
  5e6bcd:	81 fe f4 00 00 00                               	cmp    esi,0xf4
  5e6bd3:	74 20                                           	je     0x5e6bf5
  5e6bd5:	81 fe bc 02 00 00                               	cmp    esi,0x2bc
  5e6bdb:	74 18                                           	je     0x5e6bf5
  5e6bdd:	81 fe 0e 01 00 00                               	cmp    esi,0x10e
  5e6be3:	74 10                                           	je     0x5e6bf5
  5e6be5:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e6beb:	74 08                                           	je     0x5e6bf5
  5e6bed:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e6bf3:	75 0d                                           	jne    0x5e6c02
  5e6bf5:	3d 1c 07 00 00                                  	cmp    eax,0x71c
  5e6bfa:	75 06                                           	jne    0x5e6c02
  5e6bfc:	5f                                              	pop    edi
  5e6bfd:	b0 01                                           	mov    al,0x1
  5e6bff:	5e                                              	pop    esi
  5e6c00:	59                                              	pop    ecx
  5e6c01:	c3                                              	ret
  5e6c02:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e6c08:	74 35                                           	je     0x5e6c3f
  5e6c0a:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e6c10:	74 2d                                           	je     0x5e6c3f
  5e6c12:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e6c18:	74 25                                           	je     0x5e6c3f
  5e6c1a:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e6c20:	74 1d                                           	je     0x5e6c3f
  5e6c22:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e6c28:	74 15                                           	je     0x5e6c3f
  5e6c2a:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e6c30:	74 0d                                           	je     0x5e6c3f
  5e6c32:	83 fe 6b                                        	cmp    esi,0x6b
  5e6c35:	74 08                                           	je     0x5e6c3f
  5e6c37:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e6c3d:	75 0d                                           	jne    0x5e6c4c
  5e6c3f:	3d 68 04 00 00                                  	cmp    eax,0x468
  5e6c44:	75 06                                           	jne    0x5e6c4c
  5e6c46:	5f                                              	pop    edi
  5e6c47:	b0 01                                           	mov    al,0x1
  5e6c49:	5e                                              	pop    esi
  5e6c4a:	59                                              	pop    ecx
  5e6c4b:	c3                                              	ret
  5e6c4c:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e6c52:	75 36                                           	jne    0x5e6c8a
  5e6c54:	3d 86 06 00 00                                  	cmp    eax,0x686
  5e6c59:	0f 84 c8 05 00 00                               	je     0x5e7227
  5e6c5f:	3d 78 05 00 00                                  	cmp    eax,0x578
  5e6c64:	0f 84 bd 05 00 00                               	je     0x5e7227
  5e6c6a:	3d 5c 05 00 00                                  	cmp    eax,0x55c
  5e6c6f:	0f 84 b2 05 00 00                               	je     0x5e7227
  5e6c75:	3d 83 06 00 00                                  	cmp    eax,0x683
  5e6c7a:	0f 84 a7 05 00 00                               	je     0x5e7227
  5e6c80:	3d 84 06 00 00                                  	cmp    eax,0x684
  5e6c85:	e9 cc 02 00 00                                  	jmp    0x5e6f56
  5e6c8a:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e6c90:	75 20                                           	jne    0x5e6cb2
  5e6c92:	3d 8e 06 00 00                                  	cmp    eax,0x68e
  5e6c97:	0f 84 8a 05 00 00                               	je     0x5e7227
  5e6c9d:	3d 8d 06 00 00                                  	cmp    eax,0x68d
  5e6ca2:	0f 84 7f 05 00 00                               	je     0x5e7227
  5e6ca8:	3d 8f 06 00 00                                  	cmp    eax,0x68f
  5e6cad:	e9 a4 02 00 00                                  	jmp    0x5e6f56
  5e6cb2:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e6cb8:	75 10                                           	jne    0x5e6cca
  5e6cba:	33 c9                                           	xor    ecx,ecx
  5e6cbc:	3d 45 07 00 00                                  	cmp    eax,0x745
  5e6cc1:	0f 94 c1                                        	sete   cl
  5e6cc4:	5f                                              	pop    edi
  5e6cc5:	8a c1                                           	mov    al,cl
  5e6cc7:	5e                                              	pop    esi
  5e6cc8:	59                                              	pop    ecx
  5e6cc9:	c3                                              	ret
  5e6cca:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e6cd0:	75 20                                           	jne    0x5e6cf2
  5e6cd2:	3d 89 06 00 00                                  	cmp    eax,0x689
  5e6cd7:	0f 84 4a 05 00 00                               	je     0x5e7227
  5e6cdd:	3d 88 06 00 00                                  	cmp    eax,0x688
  5e6ce2:	0f 84 3f 05 00 00                               	je     0x5e7227
  5e6ce8:	3d 79 05 00 00                                  	cmp    eax,0x579
  5e6ced:	e9 64 02 00 00                                  	jmp    0x5e6f56
  5e6cf2:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e6cf8:	75 10                                           	jne    0x5e6d0a
  5e6cfa:	33 d2                                           	xor    edx,edx
  5e6cfc:	3d 0e 04 00 00                                  	cmp    eax,0x40e
  5e6d01:	0f 94 c2                                        	sete   dl
  5e6d04:	5f                                              	pop    edi
  5e6d05:	8a c2                                           	mov    al,dl
  5e6d07:	5e                                              	pop    esi
  5e6d08:	59                                              	pop    ecx
  5e6d09:	c3                                              	ret
  5e6d0a:	81 fe b7 00 00 00                               	cmp    esi,0xb7
  5e6d10:	75 10                                           	jne    0x5e6d22
  5e6d12:	33 c9                                           	xor    ecx,ecx
  5e6d14:	3d 0f 04 00 00                                  	cmp    eax,0x40f
  5e6d19:	0f 94 c1                                        	sete   cl
  5e6d1c:	5f                                              	pop    edi
  5e6d1d:	8a c1                                           	mov    al,cl
  5e6d1f:	5e                                              	pop    esi
  5e6d20:	59                                              	pop    ecx
  5e6d21:	c3                                              	ret
  5e6d22:	81 fe b4 02 00 00                               	cmp    esi,0x2b4
  5e6d28:	75 10                                           	jne    0x5e6d3a
  5e6d2a:	33 d2                                           	xor    edx,edx
  5e6d2c:	3d c7 06 00 00                                  	cmp    eax,0x6c7
  5e6d31:	0f 94 c2                                        	sete   dl
  5e6d34:	5f                                              	pop    edi
  5e6d35:	8a c2                                           	mov    al,dl
  5e6d37:	5e                                              	pop    esi
  5e6d38:	59                                              	pop    ecx
  5e6d39:	c3                                              	ret
  5e6d3a:	81 fe b5 02 00 00                               	cmp    esi,0x2b5
  5e6d40:	75 10                                           	jne    0x5e6d52
  5e6d42:	33 c9                                           	xor    ecx,ecx
  5e6d44:	3d c8 06 00 00                                  	cmp    eax,0x6c8
  5e6d49:	0f 94 c1                                        	sete   cl
  5e6d4c:	5f                                              	pop    edi
  5e6d4d:	8a c1                                           	mov    al,cl
  5e6d4f:	5e                                              	pop    esi
  5e6d50:	59                                              	pop    ecx
  5e6d51:	c3                                              	ret
  5e6d52:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e6d58:	75 20                                           	jne    0x5e6d7a
  5e6d5a:	3d c4 06 00 00                                  	cmp    eax,0x6c4
  5e6d5f:	0f 84 c2 04 00 00                               	je     0x5e7227
  5e6d65:	3d c2 06 00 00                                  	cmp    eax,0x6c2
  5e6d6a:	0f 84 b7 04 00 00                               	je     0x5e7227
  5e6d70:	3d c3 06 00 00                                  	cmp    eax,0x6c3
  5e6d75:	e9 d1 01 00 00                                  	jmp    0x5e6f4b
  5e6d7a:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e6d80:	75 32                                           	jne    0x5e6db4
  5e6d82:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e6d87:	0f 84 9a 04 00 00                               	je     0x5e7227
  5e6d8d:	3d aa 05 00 00                                  	cmp    eax,0x5aa
  5e6d92:	0f 84 8f 04 00 00                               	je     0x5e7227
  5e6d98:	3d a8 05 00 00                                  	cmp    eax,0x5a8
  5e6d9d:	0f 84 84 04 00 00                               	je     0x5e7227
  5e6da3:	3d 17 06 00 00                                  	cmp    eax,0x617
  5e6da8:	0f 84 79 04 00 00                               	je     0x5e7227
  5e6dae:	5f                                              	pop    edi
  5e6daf:	33 c0                                           	xor    eax,eax
  5e6db1:	5e                                              	pop    esi
  5e6db2:	59                                              	pop    ecx
  5e6db3:	c3                                              	ret
  5e6db4:	81 fe b5 00 00 00                               	cmp    esi,0xb5
  5e6dba:	75 3d                                           	jne    0x5e6df9
  5e6dbc:	3d 22 05 00 00                                  	cmp    eax,0x522
  5e6dc1:	0f 84 60 04 00 00                               	je     0x5e7227
  5e6dc7:	3d 21 05 00 00                                  	cmp    eax,0x521
  5e6dcc:	0f 84 55 04 00 00                               	je     0x5e7227
  5e6dd2:	3d 1e 05 00 00                                  	cmp    eax,0x51e
  5e6dd7:	0f 84 4a 04 00 00                               	je     0x5e7227
  5e6ddd:	3d 1f 05 00 00                                  	cmp    eax,0x51f
  5e6de2:	0f 84 3f 04 00 00                               	je     0x5e7227
  5e6de8:	3d 20 05 00 00                                  	cmp    eax,0x520
  5e6ded:	0f 84 34 04 00 00                               	je     0x5e7227
  5e6df3:	5f                                              	pop    edi
  5e6df4:	33 c0                                           	xor    eax,eax
  5e6df6:	5e                                              	pop    esi
  5e6df7:	59                                              	pop    ecx
  5e6df8:	c3                                              	ret
  5e6df9:	81 fe ba 0b 00 00                               	cmp    esi,0xbba
  5e6dff:	75 1c                                           	jne    0x5e6e1d
  5e6e01:	3d 22 05 00 00                                  	cmp    eax,0x522
  5e6e06:	0f 84 1b 04 00 00                               	je     0x5e7227
  5e6e0c:	3d 21 05 00 00                                  	cmp    eax,0x521
  5e6e11:	0f 84 10 04 00 00                               	je     0x5e7227
  5e6e17:	5f                                              	pop    edi
  5e6e18:	33 c0                                           	xor    eax,eax
  5e6e1a:	5e                                              	pop    esi
  5e6e1b:	59                                              	pop    ecx
  5e6e1c:	c3                                              	ret
  5e6e1d:	81 fe bb 0b 00 00                               	cmp    esi,0xbbb
  5e6e23:	75 1c                                           	jne    0x5e6e41
  5e6e25:	3d 2c 05 00 00                                  	cmp    eax,0x52c
  5e6e2a:	0f 84 f7 03 00 00                               	je     0x5e7227
  5e6e30:	3d 2d 05 00 00                                  	cmp    eax,0x52d
  5e6e35:	0f 84 ec 03 00 00                               	je     0x5e7227
  5e6e3b:	5f                                              	pop    edi
  5e6e3c:	33 c0                                           	xor    eax,eax
  5e6e3e:	5e                                              	pop    esi
  5e6e3f:	59                                              	pop    ecx
  5e6e40:	c3                                              	ret
  5e6e41:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e6e47:	75 1c                                           	jne    0x5e6e65
  5e6e49:	3d ce 05 00 00                                  	cmp    eax,0x5ce
  5e6e4e:	0f 84 d3 03 00 00                               	je     0x5e7227
  5e6e54:	3d cd 05 00 00                                  	cmp    eax,0x5cd
  5e6e59:	0f 84 c8 03 00 00                               	je     0x5e7227
  5e6e5f:	5f                                              	pop    edi
  5e6e60:	33 c0                                           	xor    eax,eax
  5e6e62:	5e                                              	pop    esi
  5e6e63:	59                                              	pop    ecx
  5e6e64:	c3                                              	ret
  5e6e65:	81 fe fb 00 00 00                               	cmp    esi,0xfb
  5e6e6b:	75 18                                           	jne    0x5e6e85
  5e6e6d:	83 f8 06                                        	cmp    eax,0x6
  5e6e70:	0f 84 b1 03 00 00                               	je     0x5e7227
  5e6e76:	83 f8 01                                        	cmp    eax,0x1
  5e6e79:	0f 84 a8 03 00 00                               	je     0x5e7227
  5e6e7f:	5f                                              	pop    edi
  5e6e80:	33 c0                                           	xor    eax,eax
  5e6e82:	5e                                              	pop    esi
  5e6e83:	59                                              	pop    ecx
  5e6e84:	c3                                              	ret
  5e6e85:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e6e8b:	75 10                                           	jne    0x5e6e9d
  5e6e8d:	33 d2                                           	xor    edx,edx
  5e6e8f:	3d cb 06 00 00                                  	cmp    eax,0x6cb
  5e6e94:	0f 94 c2                                        	sete   dl
  5e6e97:	5f                                              	pop    edi
  5e6e98:	8a c2                                           	mov    al,dl
  5e6e9a:	5e                                              	pop    esi
  5e6e9b:	59                                              	pop    ecx
  5e6e9c:	c3                                              	ret
  5e6e9d:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e6ea3:	75 0e                                           	jne    0x5e6eb3
  5e6ea5:	33 c9                                           	xor    ecx,ecx
  5e6ea7:	83 f8 01                                        	cmp    eax,0x1
  5e6eaa:	0f 94 c1                                        	sete   cl
  5e6ead:	5f                                              	pop    edi
  5e6eae:	8a c1                                           	mov    al,cl
  5e6eb0:	5e                                              	pop    esi
  5e6eb1:	59                                              	pop    ecx
  5e6eb2:	c3                                              	ret
  5e6eb3:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e6eb9:	0f 84 46 03 00 00                               	je     0x5e7205
  5e6ebf:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e6ec5:	0f 84 3a 03 00 00                               	je     0x5e7205
  5e6ecb:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e6ed1:	0f 84 13 03 00 00                               	je     0x5e71ea
  5e6ed7:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e6edd:	0f 84 07 03 00 00                               	je     0x5e71ea
  5e6ee3:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e6ee9:	75 27                                           	jne    0x5e6f12
  5e6eeb:	3d cd 06 00 00                                  	cmp    eax,0x6cd
  5e6ef0:	0f 84 31 03 00 00                               	je     0x5e7227
  5e6ef6:	3d cc 06 00 00                                  	cmp    eax,0x6cc
  5e6efb:	0f 84 26 03 00 00                               	je     0x5e7227
  5e6f01:	3d ce 06 00 00                                  	cmp    eax,0x6ce
  5e6f06:	0f 84 1b 03 00 00                               	je     0x5e7227
  5e6f0c:	5f                                              	pop    edi
  5e6f0d:	33 c0                                           	xor    eax,eax
  5e6f0f:	5e                                              	pop    esi
  5e6f10:	59                                              	pop    ecx
  5e6f11:	c3                                              	ret
  5e6f12:	81 fe b6 00 00 00                               	cmp    esi,0xb6
  5e6f18:	75 27                                           	jne    0x5e6f41
  5e6f1a:	3d c9 06 00 00                                  	cmp    eax,0x6c9
  5e6f1f:	0f 84 02 03 00 00                               	je     0x5e7227
  5e6f25:	3d 12 07 00 00                                  	cmp    eax,0x712
  5e6f2a:	0f 84 f7 02 00 00                               	je     0x5e7227
  5e6f30:	3d 24 05 00 00                                  	cmp    eax,0x524
  5e6f35:	0f 84 ec 02 00 00                               	je     0x5e7227
  5e6f3b:	5f                                              	pop    edi
  5e6f3c:	33 c0                                           	xor    eax,eax
  5e6f3e:	5e                                              	pop    esi
  5e6f3f:	59                                              	pop    ecx
  5e6f40:	c3                                              	ret
  5e6f41:	83 fe 6b                                        	cmp    esi,0x6b
  5e6f44:	75 1c                                           	jne    0x5e6f62
  5e6f46:	3d 83 05 00 00                                  	cmp    eax,0x583
  5e6f4b:	0f 84 d6 02 00 00                               	je     0x5e7227
  5e6f51:	3d c5 06 00 00                                  	cmp    eax,0x6c5
  5e6f56:	0f 84 cb 02 00 00                               	je     0x5e7227
  5e6f5c:	5f                                              	pop    edi
  5e6f5d:	33 c0                                           	xor    eax,eax
  5e6f5f:	5e                                              	pop    esi
  5e6f60:	59                                              	pop    ecx
  5e6f61:	c3                                              	ret
  5e6f62:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e6f68:	75 10                                           	jne    0x5e6f7a
  5e6f6a:	33 d2                                           	xor    edx,edx
  5e6f6c:	3d d1 06 00 00                                  	cmp    eax,0x6d1
  5e6f71:	0f 94 c2                                        	sete   dl
  5e6f74:	5f                                              	pop    edi
  5e6f75:	8a c2                                           	mov    al,dl
  5e6f77:	5e                                              	pop    esi
  5e6f78:	59                                              	pop    ecx
  5e6f79:	c3                                              	ret
  5e6f7a:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e6f80:	75 10                                           	jne    0x5e6f92
  5e6f82:	33 c9                                           	xor    ecx,ecx
  5e6f84:	3d d1 06 00 00                                  	cmp    eax,0x6d1
  5e6f89:	0f 94 c1                                        	sete   cl
  5e6f8c:	5f                                              	pop    edi
  5e6f8d:	8a c1                                           	mov    al,cl
  5e6f8f:	5e                                              	pop    esi
  5e6f90:	59                                              	pop    ecx
  5e6f91:	c3                                              	ret
  5e6f92:	81 fe 0f 01 00 00                               	cmp    esi,0x10f
  5e6f98:	0f 84 2a 02 00 00                               	je     0x5e71c8
  5e6f9e:	81 fe 1d 01 00 00                               	cmp    esi,0x11d
  5e6fa4:	0f 84 1e 02 00 00                               	je     0x5e71c8
  5e6faa:	81 fe 09 01 00 00                               	cmp    esi,0x109
  5e6fb0:	75 25                                           	jne    0x5e6fd7
  5e6fb2:	83 f8 01                                        	cmp    eax,0x1
  5e6fb5:	0f 84 6c 02 00 00                               	je     0x5e7227
  5e6fbb:	3d 25 06 00 00                                  	cmp    eax,0x625
  5e6fc0:	0f 84 61 02 00 00                               	je     0x5e7227
  5e6fc6:	3d 3b 05 00 00                                  	cmp    eax,0x53b
  5e6fcb:	0f 84 56 02 00 00                               	je     0x5e7227
  5e6fd1:	5f                                              	pop    edi
  5e6fd2:	33 c0                                           	xor    eax,eax
  5e6fd4:	5e                                              	pop    esi
  5e6fd5:	59                                              	pop    ecx
  5e6fd6:	c3                                              	ret
  5e6fd7:	81 fe 0e 01 00 00                               	cmp    esi,0x10e
  5e6fdd:	0f 84 b8 01 00 00                               	je     0x5e719b
  5e6fe3:	81 fe 1c 01 00 00                               	cmp    esi,0x11c
  5e6fe9:	0f 84 ac 01 00 00                               	je     0x5e719b
  5e6fef:	81 fe 14 01 00 00                               	cmp    esi,0x114
  5e6ff5:	75 3d                                           	jne    0x5e7034
  5e6ff7:	3d 87 06 00 00                                  	cmp    eax,0x687
  5e6ffc:	0f 84 25 02 00 00                               	je     0x5e7227
  5e7002:	3d ea 06 00 00                                  	cmp    eax,0x6ea
  5e7007:	0f 84 1a 02 00 00                               	je     0x5e7227
  5e700d:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e7012:	0f 84 0f 02 00 00                               	je     0x5e7227
  5e7018:	3d eb 06 00 00                                  	cmp    eax,0x6eb
  5e701d:	0f 84 04 02 00 00                               	je     0x5e7227
  5e7023:	3d 88 06 00 00                                  	cmp    eax,0x688
  5e7028:	0f 84 f9 01 00 00                               	je     0x5e7227
  5e702e:	5f                                              	pop    edi
  5e702f:	33 c0                                           	xor    eax,eax
  5e7031:	5e                                              	pop    esi
  5e7032:	59                                              	pop    ecx
  5e7033:	c3                                              	ret
  5e7034:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e703a:	75 48                                           	jne    0x5e7084
  5e703c:	3d 1f 06 00 00                                  	cmp    eax,0x61f
  5e7041:	0f 84 e0 01 00 00                               	je     0x5e7227
  5e7047:	3d 58 05 00 00                                  	cmp    eax,0x558
  5e704c:	0f 84 d5 01 00 00                               	je     0x5e7227
  5e7052:	3d 89 06 00 00                                  	cmp    eax,0x689
  5e7057:	0f 84 ca 01 00 00                               	je     0x5e7227
  5e705d:	3d 2d 06 00 00                                  	cmp    eax,0x62d
  5e7062:	0f 84 bf 01 00 00                               	je     0x5e7227
  5e7068:	3d 2b 06 00 00                                  	cmp    eax,0x62b
  5e706d:	0f 84 b4 01 00 00                               	je     0x5e7227
  5e7073:	3d 3d 05 00 00                                  	cmp    eax,0x53d
  5e7078:	0f 84 a9 01 00 00                               	je     0x5e7227
  5e707e:	5f                                              	pop    edi
  5e707f:	33 c0                                           	xor    eax,eax
  5e7081:	5e                                              	pop    esi
  5e7082:	59                                              	pop    ecx
  5e7083:	c3                                              	ret
  5e7084:	81 fe bc 02 00 00                               	cmp    esi,0x2bc
  5e708a:	75 1a                                           	jne    0x5e70a6
  5e708c:	83 f8 01                                        	cmp    eax,0x1
  5e708f:	0f 84 92 01 00 00                               	je     0x5e7227
  5e7095:	3d 3a 06 00 00                                  	cmp    eax,0x63a
  5e709a:	0f 84 87 01 00 00                               	je     0x5e7227
  5e70a0:	5f                                              	pop    edi
  5e70a1:	33 c0                                           	xor    eax,eax
  5e70a3:	5e                                              	pop    esi
  5e70a4:	59                                              	pop    ecx
  5e70a5:	c3                                              	ret
  5e70a6:	81 fe 16 01 00 00                               	cmp    esi,0x116
  5e70ac:	75 3d                                           	jne    0x5e70eb
  5e70ae:	3d 2b 06 00 00                                  	cmp    eax,0x62b
  5e70b3:	0f 84 6e 01 00 00                               	je     0x5e7227
  5e70b9:	3d 2d 06 00 00                                  	cmp    eax,0x62d
  5e70be:	0f 84 63 01 00 00                               	je     0x5e7227
  5e70c4:	3d c2 05 00 00                                  	cmp    eax,0x5c2
  5e70c9:	0f 84 58 01 00 00                               	je     0x5e7227
  5e70cf:	3d 02 07 00 00                                  	cmp    eax,0x702
  5e70d4:	0f 84 4d 01 00 00                               	je     0x5e7227
  5e70da:	3d 03 07 00 00                                  	cmp    eax,0x703
  5e70df:	0f 84 42 01 00 00                               	je     0x5e7227
  5e70e5:	5f                                              	pop    edi
  5e70e6:	33 c0                                           	xor    eax,eax
  5e70e8:	5e                                              	pop    esi
  5e70e9:	59                                              	pop    ecx
  5e70ea:	c3                                              	ret
  5e70eb:	81 fe ff 00 00 00                               	cmp    esi,0xff
  5e70f1:	75 1c                                           	jne    0x5e710f
  5e70f3:	3d 21 05 00 00                                  	cmp    eax,0x521
  5e70f8:	0f 84 29 01 00 00                               	je     0x5e7227
  5e70fe:	3d 22 05 00 00                                  	cmp    eax,0x522
  5e7103:	0f 84 1e 01 00 00                               	je     0x5e7227
  5e7109:	5f                                              	pop    edi
  5e710a:	33 c0                                           	xor    eax,eax
  5e710c:	5e                                              	pop    esi
  5e710d:	59                                              	pop    ecx
  5e710e:	c3                                              	ret
  5e710f:	81 fe 22 01 00 00                               	cmp    esi,0x122
  5e7115:	75 18                                           	jne    0x5e712f
  5e7117:	83 f8 01                                        	cmp    eax,0x1
  5e711a:	0f 84 07 01 00 00                               	je     0x5e7227
  5e7120:	83 f8 02                                        	cmp    eax,0x2
  5e7123:	0f 84 fe 00 00 00                               	je     0x5e7227
  5e7129:	5f                                              	pop    edi
  5e712a:	33 c0                                           	xor    eax,eax
  5e712c:	5e                                              	pop    esi
  5e712d:	59                                              	pop    ecx
  5e712e:	c3                                              	ret
  5e712f:	81 fe 12 01 00 00                               	cmp    esi,0x112
  5e7135:	75 0e                                           	jne    0x5e7145
  5e7137:	33 d2                                           	xor    edx,edx
  5e7139:	83 f8 01                                        	cmp    eax,0x1
  5e713c:	0f 94 c2                                        	sete   dl
  5e713f:	5f                                              	pop    edi
  5e7140:	8a c2                                           	mov    al,dl
  5e7142:	5e                                              	pop    esi
  5e7143:	59                                              	pop    ecx
  5e7144:	c3                                              	ret
  5e7145:	81 fe e7 00 00 00                               	cmp    esi,0xe7
  5e714b:	75 1a                                           	jne    0x5e7167
  5e714d:	83 f8 01                                        	cmp    eax,0x1
  5e7150:	0f 84 d1 00 00 00                               	je     0x5e7227
  5e7156:	3d 76 05 00 00                                  	cmp    eax,0x576
  5e715b:	0f 84 c6 00 00 00                               	je     0x5e7227
  5e7161:	5f                                              	pop    edi
  5e7162:	33 c0                                           	xor    eax,eax
  5e7164:	5e                                              	pop    esi
  5e7165:	59                                              	pop    ecx
  5e7166:	c3                                              	ret
  5e7167:	81 fe fe 00 00 00                               	cmp    esi,0xfe
  5e716d:	75 0e                                           	jne    0x5e717d
  5e716f:	33 c9                                           	xor    ecx,ecx
  5e7171:	83 f8 01                                        	cmp    eax,0x1
  5e7174:	0f 94 c1                                        	sete   cl
  5e7177:	5f                                              	pop    edi
  5e7178:	8a c1                                           	mov    al,cl
  5e717a:	5e                                              	pop    esi
  5e717b:	59                                              	pop    ecx
  5e717c:	c3                                              	ret
  5e717d:	81 fe e6 00 00 00                               	cmp    esi,0xe6
  5e7183:	74 b2                                           	je     0x5e7137
  5e7185:	81 fe f3 00 00 00                               	cmp    esi,0xf3
  5e718b:	74 aa                                           	je     0x5e7137
  5e718d:	81 fe f4 00 00 00                               	cmp    esi,0xf4
  5e7193:	74 a2                                           	je     0x5e7137
  5e7195:	5f                                              	pop    edi
  5e7196:	32 c0                                           	xor    al,al
  5e7198:	5e                                              	pop    esi
  5e7199:	59                                              	pop    ecx
  5e719a:	c3                                              	ret
  5e719b:	3d e0 06 00 00                                  	cmp    eax,0x6e0
  5e71a0:	0f 84 81 00 00 00                               	je     0x5e7227
  5e71a6:	3d e1 06 00 00                                  	cmp    eax,0x6e1
  5e71ab:	74 7a                                           	je     0x5e7227
  5e71ad:	3d e2 06 00 00                                  	cmp    eax,0x6e2
  5e71b2:	74 73                                           	je     0x5e7227
  5e71b4:	3d e4 06 00 00                                  	cmp    eax,0x6e4
  5e71b9:	74 6c                                           	je     0x5e7227
  5e71bb:	3d e3 06 00 00                                  	cmp    eax,0x6e3
  5e71c0:	74 65                                           	je     0x5e7227
  5e71c2:	5f                                              	pop    edi
  5e71c3:	33 c0                                           	xor    eax,eax
  5e71c5:	5e                                              	pop    esi
  5e71c6:	59                                              	pop    ecx
  5e71c7:	c3                                              	ret
  5e71c8:	3d 39 05 00 00                                  	cmp    eax,0x539
  5e71cd:	74 58                                           	je     0x5e7227
  5e71cf:	3d ea 06 00 00                                  	cmp    eax,0x6ea
  5e71d4:	74 51                                           	je     0x5e7227
  5e71d6:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e71db:	74 4a                                           	je     0x5e7227
  5e71dd:	3d eb 06 00 00                                  	cmp    eax,0x6eb
  5e71e2:	74 43                                           	je     0x5e7227
  5e71e4:	5f                                              	pop    edi
  5e71e5:	33 c0                                           	xor    eax,eax
  5e71e7:	5e                                              	pop    esi
  5e71e8:	59                                              	pop    ecx
  5e71e9:	c3                                              	ret
  5e71ea:	3d 9f 05 00 00                                  	cmp    eax,0x59f
  5e71ef:	74 36                                           	je     0x5e7227
  5e71f1:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e71f6:	74 2f                                           	je     0x5e7227
  5e71f8:	3d a8 05 00 00                                  	cmp    eax,0x5a8
  5e71fd:	74 28                                           	je     0x5e7227
  5e71ff:	5f                                              	pop    edi
  5e7200:	33 c0                                           	xor    eax,eax
  5e7202:	5e                                              	pop    esi
  5e7203:	59                                              	pop    ecx
  5e7204:	c3                                              	ret
  5e7205:	3d ec 06 00 00                                  	cmp    eax,0x6ec
  5e720a:	74 1b                                           	je     0x5e7227
  5e720c:	3d 88 05 00 00                                  	cmp    eax,0x588
  5e7211:	74 14                                           	je     0x5e7227
  5e7213:	3d aa 05 00 00                                  	cmp    eax,0x5aa
  5e7218:	74 0d                                           	je     0x5e7227
  5e721a:	3d a8 05 00 00                                  	cmp    eax,0x5a8
  5e721f:	74 06                                           	je     0x5e7227
  5e7221:	5f                                              	pop    edi
  5e7222:	33 c0                                           	xor    eax,eax
  5e7224:	5e                                              	pop    esi
  5e7225:	59                                              	pop    ecx
  5e7226:	c3                                              	ret
  5e7227:	5f                                              	pop    edi
  5e7228:	b8 01 00 00 00                                  	mov    eax,0x1
  5e722d:	5e                                              	pop    esi
  5e722e:	59                                              	pop    ecx
  5e722f:	c3                                              	ret
  5e7230:	51                                              	push   ecx
  5e7231:	56                                              	push   esi
  5e7232:	57                                              	push   edi
  5e7233:	8b f2                                           	mov    esi,edx
  5e7235:	6a f0                                           	push   0xfffffff0
  5e7237:	8b f9                                           	mov    edi,ecx
  5e7239:	56                                              	push   esi
  5e723a:	ff 15 8c a4 79 00                               	call   DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  5e7240:	83 e0 0b                                        	and    eax,0xb
  5e7243:	3c 0b                                           	cmp    al,0xb
  5e7245:	75 45                                           	jne    0x5e728c
  5e7247:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e724c:	89 74 24 08                                     	mov    DWORD PTR [esp+0x8],esi
  5e7250:	85 c0                                           	test   eax,eax
  5e7252:	74 38                                           	je     0x5e728c
  5e7254:	8d 4c 24 08                                     	lea    ecx,[esp+0x8]
  5e7258:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e725e:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e7264:	ba 01 00 00 00                                  	mov    edx,0x1
  5e7269:	d3 e2                                           	shl    edx,cl
  5e726b:	4a                                              	dec    edx
  5e726c:	23 d0                                           	and    edx,eax
  5e726e:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e7273:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e7276:	85 c0                                           	test   eax,eax
  5e7278:	74 12                                           	je     0x5e728c
  5e727a:	8b 4c 24 08                                     	mov    ecx,DWORD PTR [esp+0x8]
  5e727e:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e7280:	74 10                                           	je     0x5e7292
  5e7282:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e7288:	85 c0                                           	test   eax,eax
  5e728a:	75 f2                                           	jne    0x5e727e
  5e728c:	5f                                              	pop    edi
  5e728d:	32 c0                                           	xor    al,al
  5e728f:	5e                                              	pop    esi
  5e7290:	59                                              	pop    ecx
  5e7291:	c3                                              	ret
  5e7292:	85 c0                                           	test   eax,eax
  5e7294:	74 f6                                           	je     0x5e728c
  5e7296:	83 c0 04                                        	add    eax,0x4
  5e7299:	85 c0                                           	test   eax,eax
  5e729b:	74 ef                                           	je     0x5e728c
  5e729d:	8b 48 68                                        	mov    ecx,DWORD PTR [eax+0x68]
  5e72a0:	85 c9                                           	test   ecx,ecx
  5e72a2:	75 e8                                           	jne    0x5e728c
  5e72a4:	8b d6                                           	mov    edx,esi
  5e72a6:	8b cf                                           	mov    ecx,edi
  5e72a8:	e8 b3 f5 ff ff                                  	call   0x5e6860
  5e72ad:	5f                                              	pop    edi
  5e72ae:	5e                                              	pop    esi
  5e72af:	59                                              	pop    ecx
  5e72b0:	c3                                              	ret
  5e72b1:	90                                              	nop
  5e72b2:	90                                              	nop
  5e72b3:	90                                              	nop
  5e72b4:	90                                              	nop
  5e72b5:	90                                              	nop
  5e72b6:	90                                              	nop
  5e72b7:	90                                              	nop
  5e72b8:	90                                              	nop
  5e72b9:	90                                              	nop
  5e72ba:	90                                              	nop
  5e72bb:	90                                              	nop
  5e72bc:	90                                              	nop
  5e72bd:	90                                              	nop
  5e72be:	90                                              	nop
  5e72bf:	90                                              	nop

; 0x5e72c0 <= VA < 0x5e7640: Bottom predicate: relevant battle-family resources select1670. Continued unrelated cases omitted.
  5e72c0:	51                                              	push   ecx
  5e72c1:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e72c6:	56                                              	push   esi
  5e72c7:	57                                              	push   edi
  5e72c8:	8b fa                                           	mov    edi,edx
  5e72ca:	85 c0                                           	test   eax,eax
  5e72cc:	89 4c 24 08                                     	mov    DWORD PTR [esp+0x8],ecx
  5e72d0:	74 38                                           	je     0x5e730a
  5e72d2:	8d 4c 24 08                                     	lea    ecx,[esp+0x8]
  5e72d6:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e72dc:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e72e2:	ba 01 00 00 00                                  	mov    edx,0x1
  5e72e7:	d3 e2                                           	shl    edx,cl
  5e72e9:	4a                                              	dec    edx
  5e72ea:	23 d0                                           	and    edx,eax
  5e72ec:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e72f1:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e72f4:	85 c0                                           	test   eax,eax
  5e72f6:	74 12                                           	je     0x5e730a
  5e72f8:	8b 4c 24 08                                     	mov    ecx,DWORD PTR [esp+0x8]
  5e72fc:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e72fe:	74 2b                                           	je     0x5e732b
  5e7300:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e7306:	85 c0                                           	test   eax,eax
  5e7308:	75 f2                                           	jne    0x5e72fc
  5e730a:	33 f6                                           	xor    esi,esi
  5e730c:	57                                              	push   edi
  5e730d:	ff 15 f4 a3 79 00                               	call   DWORD PTR ds:0x79a3f4 ; USER32.dll!GetDlgCtrlID
  5e7313:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e7319:	75 20                                           	jne    0x5e733b
  5e731b:	33 c9                                           	xor    ecx,ecx
  5e731d:	3d ee 03 00 00                                  	cmp    eax,0x3ee
  5e7322:	0f 94 c1                                        	sete   cl
  5e7325:	5f                                              	pop    edi
  5e7326:	8a c1                                           	mov    al,cl
  5e7328:	5e                                              	pop    esi
  5e7329:	59                                              	pop    ecx
  5e732a:	c3                                              	ret
  5e732b:	85 c0                                           	test   eax,eax
  5e732d:	74 db                                           	je     0x5e730a
  5e732f:	83 c0 04                                        	add    eax,0x4
  5e7332:	85 c0                                           	test   eax,eax
  5e7334:	74 d4                                           	je     0x5e730a
  5e7336:	8b 70 6c                                        	mov    esi,DWORD PTR [eax+0x6c]
  5e7339:	eb d1                                           	jmp    0x5e730c
  5e733b:	83 fe 73                                        	cmp    esi,0x73
  5e733e:	0f 84 bd 02 00 00                               	je     0x5e7601
  5e7344:	81 fe 0c 01 00 00                               	cmp    esi,0x10c
  5e734a:	0f 84 b1 02 00 00                               	je     0x5e7601
  5e7350:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e7356:	0f 84 a5 02 00 00                               	je     0x5e7601
  5e735c:	81 fe 08 01 00 00                               	cmp    esi,0x108
  5e7362:	75 10                                           	jne    0x5e7374
  5e7364:	33 d2                                           	xor    edx,edx
  5e7366:	3d d1 06 00 00                                  	cmp    eax,0x6d1
  5e736b:	0f 94 c2                                        	sete   dl
  5e736e:	5f                                              	pop    edi
  5e736f:	8a c2                                           	mov    al,dl
  5e7371:	5e                                              	pop    esi
  5e7372:	59                                              	pop    ecx
  5e7373:	c3                                              	ret
  5e7374:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e737a:	0f 84 71 02 00 00                               	je     0x5e75f1
  5e7380:	81 fe b6 00 00 00                               	cmp    esi,0xb6
  5e7386:	0f 84 65 02 00 00                               	je     0x5e75f1
  5e738c:	81 fe a3 00 00 00                               	cmp    esi,0xa3
  5e7392:	0f 84 59 02 00 00                               	je     0x5e75f1
  5e7398:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e739e:	0f 84 4d 02 00 00                               	je     0x5e75f1
  5e73a4:	81 fe bb 0b 00 00                               	cmp    esi,0xbbb
  5e73aa:	0f 84 41 02 00 00                               	je     0x5e75f1
  5e73b0:	81 fe f5 00 00 00                               	cmp    esi,0xf5
  5e73b6:	0f 84 35 02 00 00                               	je     0x5e75f1
  5e73bc:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e73c2:	0f 84 29 02 00 00                               	je     0x5e75f1
  5e73c8:	81 fe b5 02 00 00                               	cmp    esi,0x2b5
  5e73ce:	0f 84 1d 02 00 00                               	je     0x5e75f1
  5e73d4:	81 fe b7 00 00 00                               	cmp    esi,0xb7
  5e73da:	0f 84 11 02 00 00                               	je     0x5e75f1
  5e73e0:	81 fe b4 02 00 00                               	cmp    esi,0x2b4
  5e73e6:	0f 84 05 02 00 00                               	je     0x5e75f1
  5e73ec:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e73f2:	0f 84 f9 01 00 00                               	je     0x5e75f1
  5e73f8:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e73fe:	0f 84 ed 01 00 00                               	je     0x5e75f1
  5e7404:	81 fe b5 00 00 00                               	cmp    esi,0xb5
  5e740a:	0f 84 e1 01 00 00                               	je     0x5e75f1
  5e7410:	81 fe ba 0b 00 00                               	cmp    esi,0xbba
  5e7416:	0f 84 d5 01 00 00                               	je     0x5e75f1
  5e741c:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e7422:	0f 84 c9 01 00 00                               	je     0x5e75f1
  5e7428:	81 fe b8 00 00 00                               	cmp    esi,0xb8
  5e742e:	0f 84 bd 01 00 00                               	je     0x5e75f1
  5e7434:	81 fe d6 00 00 00                               	cmp    esi,0xd6
  5e743a:	0f 84 b1 01 00 00                               	je     0x5e75f1
  5e7440:	81 fe 25 01 00 00                               	cmp    esi,0x125
  5e7446:	0f 84 a5 01 00 00                               	je     0x5e75f1
  5e744c:	81 fe 16 01 00 00                               	cmp    esi,0x116
  5e7452:	0f 84 99 01 00 00                               	je     0x5e75f1
  5e7458:	81 fe 1d 01 00 00                               	cmp    esi,0x11d
  5e745e:	0f 84 8d 01 00 00                               	je     0x5e75f1
  5e7464:	81 fe 1c 01 00 00                               	cmp    esi,0x11c
  5e746a:	0f 84 81 01 00 00                               	je     0x5e75f1
  5e7470:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e7476:	0f 84 75 01 00 00                               	je     0x5e75f1
  5e747c:	81 fe 09 01 00 00                               	cmp    esi,0x109
  5e7482:	0f 84 69 01 00 00                               	je     0x5e75f1
  5e7488:	81 fe 0f 01 00 00                               	cmp    esi,0x10f
  5e748e:	0f 84 5d 01 00 00                               	je     0x5e75f1
  5e7494:	81 fe 14 01 00 00                               	cmp    esi,0x114
  5e749a:	0f 84 51 01 00 00                               	je     0x5e75f1
  5e74a0:	81 fe 0e 01 00 00                               	cmp    esi,0x10e
  5e74a6:	0f 84 45 01 00 00                               	je     0x5e75f1
  5e74ac:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e74b2:	0f 84 29 01 00 00                               	je     0x5e75e1
  5e74b8:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e74be:	0f 84 1d 01 00 00                               	je     0x5e75e1
  5e74c4:	83 fe 6b                                        	cmp    esi,0x6b
  5e74c7:	0f 84 14 01 00 00                               	je     0x5e75e1
  5e74cd:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e74d3:	0f 84 08 01 00 00                               	je     0x5e75e1
  5e74d9:	81 fe 17 01 00 00                               	cmp    esi,0x117
  5e74df:	0f 84 fc 00 00 00                               	je     0x5e75e1
  5e74e5:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e74eb:	0f 84 f0 00 00 00                               	je     0x5e75e1
  5e74f1:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e74f7:	0f 84 d6 00 00 00                               	je     0x5e75d3
  5e74fd:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e7503:	0f 84 ca 00 00 00                               	je     0x5e75d3
  5e7509:	81 fe ea 00 00 00                               	cmp    esi,0xea
  5e750f:	0f 84 be 00 00 00                               	je     0x5e75d3
  5e7515:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e751b:	0f 84 b2 00 00 00                               	je     0x5e75d3
  5e7521:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e7527:	0f 84 a6 00 00 00                               	je     0x5e75d3
  5e752d:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e7533:	0f 84 9a 00 00 00                               	je     0x5e75d3
  5e7539:	81 fe bc 02 00 00                               	cmp    esi,0x2bc
  5e753f:	0f 84 8e 00 00 00                               	je     0x5e75d3
  5e7545:	81 fe e7 00 00 00                               	cmp    esi,0xe7
  5e754b:	0f 84 82 00 00 00                               	je     0x5e75d3
  5e7551:	81 fe e6 00 00 00                               	cmp    esi,0xe6
  5e7557:	74 7a                                           	je     0x5e75d3
  5e7559:	81 fe f3 00 00 00                               	cmp    esi,0xf3
  5e755f:	74 72                                           	je     0x5e75d3
  5e7561:	81 fe f4 00 00 00                               	cmp    esi,0xf4
  5e7567:	74 6a                                           	je     0x5e75d3
  5e7569:	81 fe 22 01 00 00                               	cmp    esi,0x122
  5e756f:	74 62                                           	je     0x5e75d3
  5e7571:	81 fe 12 01 00 00                               	cmp    esi,0x112
  5e7577:	74 5a                                           	je     0x5e75d3
  5e7579:	81 fe fe 00 00 00                               	cmp    esi,0xfe
  5e757f:	74 52                                           	je     0x5e75d3
  5e7581:	81 fe fc 00 00 00                               	cmp    esi,0xfc
  5e7587:	74 4a                                           	je     0x5e75d3
  5e7589:	81 fe d4 00 00 00                               	cmp    esi,0xd4
  5e758f:	75 0e                                           	jne    0x5e759f
  5e7591:	33 c9                                           	xor    ecx,ecx
  5e7593:	83 f8 01                                        	cmp    eax,0x1
  5e7596:	0f 94 c1                                        	sete   cl
  5e7599:	5f                                              	pop    edi
  5e759a:	8a c1                                           	mov    al,cl
  5e759c:	5e                                              	pop    esi
  5e759d:	59                                              	pop    ecx
  5e759e:	c3                                              	ret
  5e759f:	81 fe fb 00 00 00                               	cmp    esi,0xfb
  5e75a5:	75 0e                                           	jne    0x5e75b5
  5e75a7:	33 d2                                           	xor    edx,edx
  5e75a9:	83 f8 07                                        	cmp    eax,0x7
  5e75ac:	0f 94 c2                                        	sete   dl
  5e75af:	5f                                              	pop    edi
  5e75b0:	8a c2                                           	mov    al,dl
  5e75b2:	5e                                              	pop    esi
  5e75b3:	59                                              	pop    ecx
  5e75b4:	c3                                              	ret
  5e75b5:	81 fe ff 00 00 00                               	cmp    esi,0xff
  5e75bb:	75 10                                           	jne    0x5e75cd
  5e75bd:	33 c9                                           	xor    ecx,ecx
  5e75bf:	3d 75 06 00 00                                  	cmp    eax,0x675
  5e75c4:	0f 94 c1                                        	sete   cl
  5e75c7:	5f                                              	pop    edi
  5e75c8:	8a c1                                           	mov    al,cl
  5e75ca:	5e                                              	pop    esi
  5e75cb:	59                                              	pop    ecx
  5e75cc:	c3                                              	ret
  5e75cd:	5f                                              	pop    edi
  5e75ce:	32 c0                                           	xor    al,al
  5e75d0:	5e                                              	pop    esi
  5e75d1:	59                                              	pop    ecx
  5e75d2:	c3                                              	ret
  5e75d3:	33 d2                                           	xor    edx,edx
  5e75d5:	83 f8 02                                        	cmp    eax,0x2
  5e75d8:	0f 94 c2                                        	sete   dl
  5e75db:	5f                                              	pop    edi
  5e75dc:	8a c2                                           	mov    al,dl
  5e75de:	5e                                              	pop    esi
  5e75df:	59                                              	pop    ecx
  5e75e0:	c3                                              	ret
  5e75e1:	33 c9                                           	xor    ecx,ecx
  5e75e3:	3d c0 05 00 00                                  	cmp    eax,0x5c0
  5e75e8:	0f 94 c1                                        	sete   cl
  5e75eb:	5f                                              	pop    edi
  5e75ec:	8a c1                                           	mov    al,cl
  5e75ee:	5e                                              	pop    esi
  5e75ef:	59                                              	pop    ecx
  5e75f0:	c3                                              	ret
  5e75f1:	33 d2                                           	xor    edx,edx
  5e75f3:	3d 86 06 00 00                                  	cmp    eax,0x686
  5e75f8:	0f 94 c2                                        	sete   dl
  5e75fb:	5f                                              	pop    edi
  5e75fc:	8a c2                                           	mov    al,dl
  5e75fe:	5e                                              	pop    esi
  5e75ff:	59                                              	pop    ecx
  5e7600:	c3                                              	ret
  5e7601:	33 c9                                           	xor    ecx,ecx
  5e7603:	3d 23 04 00 00                                  	cmp    eax,0x423
  5e7608:	0f 94 c1                                        	sete   cl
  5e760b:	5f                                              	pop    edi
  5e760c:	8a c1                                           	mov    al,cl
  5e760e:	5e                                              	pop    esi
  5e760f:	59                                              	pop    ecx
  5e7610:	c3                                              	ret
  5e7611:	90                                              	nop
  5e7612:	90                                              	nop
  5e7613:	90                                              	nop
  5e7614:	90                                              	nop
  5e7615:	90                                              	nop
  5e7616:	90                                              	nop
  5e7617:	90                                              	nop
  5e7618:	90                                              	nop
  5e7619:	90                                              	nop
  5e761a:	90                                              	nop
  5e761b:	90                                              	nop
  5e761c:	90                                              	nop
  5e761d:	90                                              	nop
  5e761e:	90                                              	nop
  5e761f:	90                                              	nop
  5e7620:	51                                              	push   ecx
  5e7621:	56                                              	push   esi
  5e7622:	57                                              	push   edi
  5e7623:	8b f2                                           	mov    esi,edx
  5e7625:	6a f0                                           	push   0xfffffff0
  5e7627:	8b f9                                           	mov    edi,ecx
  5e7629:	56                                              	push   esi
  5e762a:	ff 15 8c a4 79 00                               	call   DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  5e7630:	83 e0 0b                                        	and    eax,0xb
  5e7633:	3c 0b                                           	cmp    al,0xb
  5e7635:	75 45                                           	jne    0x5e767c
  5e7637:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e763c:	89 74 24 08                                     	mov    DWORD PTR [esp+0x8],esi

; 0x5df660 <= VA < 0x5df8d8: Help-family membership includes181,184,3003. Used with control1685.
  5df660:	81 f9 0c 01 00 00                               	cmp    ecx,0x10c
  5df666:	0f 84 69 02 00 00                               	je     0x5df8d5
  5df66c:	81 f9 94 00 00 00                               	cmp    ecx,0x94
  5df672:	0f 84 5d 02 00 00                               	je     0x5df8d5
  5df678:	81 f9 b6 00 00 00                               	cmp    ecx,0xb6
  5df67e:	0f 84 51 02 00 00                               	je     0x5df8d5
  5df684:	81 f9 a3 00 00 00                               	cmp    ecx,0xa3
  5df68a:	0f 84 45 02 00 00                               	je     0x5df8d5
  5df690:	83 f9 73                                        	cmp    ecx,0x73
  5df693:	0f 84 3c 02 00 00                               	je     0x5df8d5
  5df699:	81 f9 d8 00 00 00                               	cmp    ecx,0xd8
  5df69f:	0f 84 30 02 00 00                               	je     0x5df8d5
  5df6a5:	81 f9 bb 0b 00 00                               	cmp    ecx,0xbbb
  5df6ab:	0f 84 24 02 00 00                               	je     0x5df8d5
  5df6b1:	81 f9 f5 00 00 00                               	cmp    ecx,0xf5
  5df6b7:	0f 84 18 02 00 00                               	je     0x5df8d5
  5df6bd:	81 f9 05 01 00 00                               	cmp    ecx,0x105
  5df6c3:	0f 84 0c 02 00 00                               	je     0x5df8d5
  5df6c9:	81 f9 e2 00 00 00                               	cmp    ecx,0xe2
  5df6cf:	0f 84 00 02 00 00                               	je     0x5df8d5
  5df6d5:	81 f9 d5 00 00 00                               	cmp    ecx,0xd5
  5df6db:	0f 84 f4 01 00 00                               	je     0x5df8d5
  5df6e1:	81 f9 b5 02 00 00                               	cmp    ecx,0x2b5
  5df6e7:	0f 84 e8 01 00 00                               	je     0x5df8d5
  5df6ed:	81 f9 b7 00 00 00                               	cmp    ecx,0xb7
  5df6f3:	0f 84 dc 01 00 00                               	je     0x5df8d5
  5df6f9:	81 f9 b4 02 00 00                               	cmp    ecx,0x2b4
  5df6ff:	0f 84 d0 01 00 00                               	je     0x5df8d5
  5df705:	81 f9 01 01 00 00                               	cmp    ecx,0x101
  5df70b:	0f 84 c4 01 00 00                               	je     0x5df8d5
  5df711:	81 f9 29 01 00 00                               	cmp    ecx,0x129
  5df717:	0f 84 b8 01 00 00                               	je     0x5df8d5
  5df71d:	81 f9 c7 0b 00 00                               	cmp    ecx,0xbc7
  5df723:	0f 84 ac 01 00 00                               	je     0x5df8d5
  5df729:	81 f9 c6 0b 00 00                               	cmp    ecx,0xbc6
  5df72f:	0f 84 a0 01 00 00                               	je     0x5df8d5
  5df735:	81 f9 d7 00 00 00                               	cmp    ecx,0xd7
  5df73b:	0f 84 94 01 00 00                               	je     0x5df8d5
  5df741:	81 f9 08 01 00 00                               	cmp    ecx,0x108
  5df747:	0f 84 88 01 00 00                               	je     0x5df8d5
  5df74d:	81 f9 bc 00 00 00                               	cmp    ecx,0xbc
  5df753:	0f 84 7c 01 00 00                               	je     0x5df8d5
  5df759:	81 f9 bd 00 00 00                               	cmp    ecx,0xbd
  5df75f:	0f 84 70 01 00 00                               	je     0x5df8d5
  5df765:	81 f9 bb 00 00 00                               	cmp    ecx,0xbb
  5df76b:	0f 84 64 01 00 00                               	je     0x5df8d5
  5df771:	81 f9 b5 00 00 00                               	cmp    ecx,0xb5
  5df777:	0f 84 58 01 00 00                               	je     0x5df8d5
  5df77d:	81 f9 ba 0b 00 00                               	cmp    ecx,0xbba
  5df783:	0f 84 4c 01 00 00                               	je     0x5df8d5
  5df789:	81 f9 ff 00 00 00                               	cmp    ecx,0xff
  5df78f:	0f 84 40 01 00 00                               	je     0x5df8d5
  5df795:	81 f9 ea 00 00 00                               	cmp    ecx,0xea
  5df79b:	0f 84 34 01 00 00                               	je     0x5df8d5
  5df7a1:	83 f9 6b                                        	cmp    ecx,0x6b
  5df7a4:	0f 84 2b 01 00 00                               	je     0x5df8d5
  5df7aa:	81 f9 00 01 00 00                               	cmp    ecx,0x100
  5df7b0:	0f 84 1f 01 00 00                               	je     0x5df8d5
  5df7b6:	81 f9 02 01 00 00                               	cmp    ecx,0x102
  5df7bc:	0f 84 13 01 00 00                               	je     0x5df8d5
  5df7c2:	81 f9 b8 00 00 00                               	cmp    ecx,0xb8
  5df7c8:	0f 84 07 01 00 00                               	je     0x5df8d5
  5df7ce:	81 f9 d6 00 00 00                               	cmp    ecx,0xd6
  5df7d4:	0f 84 fb 00 00 00                               	je     0x5df8d5
  5df7da:	81 f9 03 01 00 00                               	cmp    ecx,0x103
  5df7e0:	0f 84 ef 00 00 00                               	je     0x5df8d5
  5df7e6:	81 f9 1f 01 00 00                               	cmp    ecx,0x11f
  5df7ec:	0f 84 e3 00 00 00                               	je     0x5df8d5
  5df7f2:	81 f9 25 01 00 00                               	cmp    ecx,0x125
  5df7f8:	0f 84 d7 00 00 00                               	je     0x5df8d5
  5df7fe:	81 f9 15 01 00 00                               	cmp    ecx,0x115
  5df804:	0f 84 cb 00 00 00                               	je     0x5df8d5
  5df80a:	81 f9 22 01 00 00                               	cmp    ecx,0x122
  5df810:	0f 84 bf 00 00 00                               	je     0x5df8d5
  5df816:	81 f9 12 01 00 00                               	cmp    ecx,0x112
  5df81c:	0f 84 b3 00 00 00                               	je     0x5df8d5
  5df822:	81 f9 e7 00 00 00                               	cmp    ecx,0xe7
  5df828:	0f 84 a7 00 00 00                               	je     0x5df8d5
  5df82e:	81 f9 16 01 00 00                               	cmp    ecx,0x116
  5df834:	0f 84 9b 00 00 00                               	je     0x5df8d5
  5df83a:	81 f9 c2 00 00 00                               	cmp    ecx,0xc2
  5df840:	0f 84 8f 00 00 00                               	je     0x5df8d5
  5df846:	81 f9 c9 00 00 00                               	cmp    ecx,0xc9
  5df84c:	0f 84 83 00 00 00                               	je     0x5df8d5
  5df852:	81 f9 1d 01 00 00                               	cmp    ecx,0x11d
  5df858:	74 7b                                           	je     0x5df8d5
  5df85a:	81 f9 1c 01 00 00                               	cmp    ecx,0x11c
  5df860:	74 73                                           	je     0x5df8d5
  5df862:	81 f9 13 01 00 00                               	cmp    ecx,0x113
  5df868:	74 6b                                           	je     0x5df8d5
  5df86a:	81 f9 fe 00 00 00                               	cmp    ecx,0xfe
  5df870:	74 63                                           	je     0x5df8d5
  5df872:	81 f9 09 01 00 00                               	cmp    ecx,0x109
  5df878:	74 5b                                           	je     0x5df8d5
  5df87a:	81 f9 0f 01 00 00                               	cmp    ecx,0x10f
  5df880:	74 53                                           	je     0x5df8d5
  5df882:	81 f9 17 01 00 00                               	cmp    ecx,0x117
  5df888:	74 4b                                           	je     0x5df8d5
  5df88a:	81 f9 14 01 00 00                               	cmp    ecx,0x114
  5df890:	74 43                                           	je     0x5df8d5
  5df892:	81 f9 c3 00 00 00                               	cmp    ecx,0xc3
  5df898:	74 3b                                           	je     0x5df8d5
  5df89a:	81 f9 24 01 00 00                               	cmp    ecx,0x124
  5df8a0:	74 33                                           	je     0x5df8d5
  5df8a2:	81 f9 e6 00 00 00                               	cmp    ecx,0xe6
  5df8a8:	74 2b                                           	je     0x5df8d5
  5df8aa:	81 f9 f3 00 00 00                               	cmp    ecx,0xf3
  5df8b0:	74 23                                           	je     0x5df8d5
  5df8b2:	81 f9 f4 00 00 00                               	cmp    ecx,0xf4
  5df8b8:	74 1b                                           	je     0x5df8d5
  5df8ba:	81 f9 bc 02 00 00                               	cmp    ecx,0x2bc
  5df8c0:	74 13                                           	je     0x5df8d5
  5df8c2:	81 f9 1b 01 00 00                               	cmp    ecx,0x11b
  5df8c8:	74 0b                                           	je     0x5df8d5
  5df8ca:	81 f9 0e 01 00 00                               	cmp    ecx,0x10e
  5df8d0:	74 03                                           	je     0x5df8d5
  5df8d2:	32 c0                                           	xor    al,al
  5df8d4:	c3                                              	ret
  5df8d5:	b0 01                                           	mov    al,0x1
  5df8d7:	c3                                              	ret

; 0x5e8c50 <= VA < 0x5e9260: Final right authored button, right generic/title, bottom authored button, bottom generic, and help placement helpers.
  5e8c50:	83 ec 54                                        	sub    esp,0x54
  5e8c53:	53                                              	push   ebx
  5e8c54:	55                                              	push   ebp
  5e8c55:	56                                              	push   esi
  5e8c56:	8b e9                                           	mov    ebp,ecx
  5e8c58:	57                                              	push   edi
  5e8c59:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  5e8c5d:	55                                              	push   ebp
  5e8c5e:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e8c64:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e8c69:	8b f0                                           	mov    esi,eax
  5e8c6b:	e8 a0 a2 08 00                                  	call   0x672f10
  5e8c70:	8a d8                                           	mov    bl,al
  5e8c72:	8d 44 24 24                                     	lea    eax,[esp+0x24]
  5e8c76:	50                                              	push   eax
  5e8c77:	56                                              	push   esi
  5e8c78:	8b 35 98 a3 79 00                               	mov    esi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e8c7e:	ff d6                                           	call   esi
  5e8c80:	8d 4c 24 54                                     	lea    ecx,[esp+0x54]
  5e8c84:	51                                              	push   ecx
  5e8c85:	55                                              	push   ebp
  5e8c86:	ff d6                                           	call   esi
  5e8c88:	8b 7c 24 24                                     	mov    edi,DWORD PTR [esp+0x24]
  5e8c8c:	8b 4c 24 2c                                     	mov    ecx,DWORD PTR [esp+0x2c]
  5e8c90:	8b c1                                           	mov    eax,ecx
  5e8c92:	2b c7                                           	sub    eax,edi
  5e8c94:	33 ff                                           	xor    edi,edi
  5e8c96:	84 db                                           	test   bl,bl
  5e8c98:	75 18                                           	jne    0x5e8cb2
  5e8c9a:	2b 05 6c dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add6c
  5e8ca0:	99                                              	cdq
  5e8ca1:	2b c2                                           	sub    eax,edx
  5e8ca3:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8ca8:	8b f8                                           	mov    edi,eax
  5e8caa:	d1 ff                                           	sar    edi,1
  5e8cac:	0f 98 c2                                        	sets   dl
  5e8caf:	4a                                              	dec    edx
  5e8cb0:	23 fa                                           	and    edi,edx
  5e8cb2:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5e8cb6:	8b 54 24 28                                     	mov    edx,DWORD PTR [esp+0x28]
  5e8cba:	2b c2                                           	sub    eax,edx
  5e8cbc:	84 db                                           	test   bl,bl
  5e8cbe:	0f 85 b0 00 00 00                               	jne    0x5e8d74
  5e8cc4:	8b 1d 78 dd 7a 00                               	mov    ebx,DWORD PTR ds:0x7add78
  5e8cca:	2b c3                                           	sub    eax,ebx
  5e8ccc:	99                                              	cdq
  5e8ccd:	2b c2                                           	sub    eax,edx
  5e8ccf:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8cd4:	d1 f8                                           	sar    eax,1
  5e8cd6:	0f 98 c2                                        	sets   dl
  5e8cd9:	4a                                              	dec    edx
  5e8cda:	23 d0                                           	and    edx,eax
  5e8cdc:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e8ce0:	8b f2                                           	mov    esi,edx
  5e8ce2:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  5e8ce5:	2b c3                                           	sub    eax,ebx
  5e8ce7:	99                                              	cdq
  5e8ce8:	2b c2                                           	sub    eax,edx
  5e8cea:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8cef:	d1 f8                                           	sar    eax,1
  5e8cf1:	0f 98 c2                                        	sets   dl
  5e8cf4:	4a                                              	dec    edx
  5e8cf5:	2b cf                                           	sub    ecx,edi
  5e8cf7:	8b 7c 24 24                                     	mov    edi,DWORD PTR [esp+0x24]
  5e8cfb:	23 c2                                           	and    eax,edx
  5e8cfd:	2b f0                                           	sub    esi,eax
  5e8cff:	a1 b8 10 ac 00                                  	mov    eax,ds:0xac10b8
  5e8d04:	2b cf                                           	sub    ecx,edi
  5e8d06:	0f bf 50 02                                     	movsx  edx,WORD PTR [eax+0x2]
  5e8d0a:	0f bf 58 04                                     	movsx  ebx,WORD PTR [eax+0x4]
  5e8d0e:	a1 c8 11 ac 00                                  	mov    eax,ds:0xac11c8
  5e8d13:	81 e9 9c 00 00 00                               	sub    ecx,0x9c
  5e8d19:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  5e8d1d:	89 4c 24 20                                     	mov    DWORD PTR [esp+0x20],ecx
  5e8d21:	8b 50 04                                        	mov    edx,DWORD PTR [eax+0x4]
  5e8d24:	8b 4c 24 58                                     	mov    ecx,DWORD PTR [esp+0x58]
  5e8d28:	8b 78 0c                                        	mov    edi,DWORD PTR [eax+0xc]
  5e8d2b:	89 54 24 1c                                     	mov    DWORD PTR [esp+0x1c],edx
  5e8d2f:	2b ca                                           	sub    ecx,edx
  5e8d31:	8b 54 24 28                                     	mov    edx,DWORD PTR [esp+0x28]
  5e8d35:	2b ca                                           	sub    ecx,edx
  5e8d37:	03 ce                                           	add    ecx,esi
  5e8d39:	8b f7                                           	mov    esi,edi
  5e8d3b:	8b c1                                           	mov    eax,ecx
  5e8d3d:	99                                              	cdq
  5e8d3e:	f7 ff                                           	idiv   edi
  5e8d40:	0f af f0                                        	imul   esi,eax
  5e8d43:	89 44 24 10                                     	mov    DWORD PTR [esp+0x10],eax
  5e8d47:	8b c7                                           	mov    eax,edi
  5e8d49:	2b c1                                           	sub    eax,ecx
  5e8d4b:	03 c6                                           	add    eax,esi
  5e8d4d:	99                                              	cdq
  5e8d4e:	33 c2                                           	xor    eax,edx
  5e8d50:	2b c2                                           	sub    eax,edx
  5e8d52:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  5e8d56:	8b c1                                           	mov    eax,ecx
  5e8d58:	8b 4c 24 18                                     	mov    ecx,DWORD PTR [esp+0x18]
  5e8d5c:	2b c6                                           	sub    eax,esi
  5e8d5e:	99                                              	cdq
  5e8d5f:	33 c2                                           	xor    eax,edx
  5e8d61:	2b c2                                           	sub    eax,edx
  5e8d63:	3b c1                                           	cmp    eax,ecx
  5e8d65:	0f 8d 87 00 00 00                               	jge    0x5e8df2
  5e8d6b:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e8d6f:	e9 85 00 00 00                                  	jmp    0x5e8df9
  5e8d74:	a1 f8 0f ac 00                                  	mov    eax,ds:0xac0ff8
  5e8d79:	2b cf                                           	sub    ecx,edi
  5e8d7b:	8b 7c 24 24                                     	mov    edi,DWORD PTR [esp+0x24]
  5e8d7f:	55                                              	push   ebp
  5e8d80:	0f bf 50 02                                     	movsx  edx,WORD PTR [eax+0x2]
  5e8d84:	0f bf 58 04                                     	movsx  ebx,WORD PTR [eax+0x4]
  5e8d88:	a1 ec 11 ac 00                                  	mov    eax,ds:0xac11ec
  5e8d8d:	2b cf                                           	sub    ecx,edi
  5e8d8f:	81 e9 93 00 00 00                               	sub    ecx,0x93
  5e8d95:	89 54 24 18                                     	mov    DWORD PTR [esp+0x18],edx
  5e8d99:	89 44 24 14                                     	mov    DWORD PTR [esp+0x14],eax
  5e8d9d:	8b f9                                           	mov    edi,ecx
  5e8d9f:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e8da5:	8d 4c 24 44                                     	lea    ecx,[esp+0x44]
  5e8da9:	51                                              	push   ecx
  5e8daa:	50                                              	push   eax
  5e8dab:	ff d6                                           	call   esi
  5e8dad:	8d 54 24 34                                     	lea    edx,[esp+0x34]
  5e8db1:	52                                              	push   edx
  5e8db2:	55                                              	push   ebp
  5e8db3:	ff d6                                           	call   esi
  5e8db5:	8b 4c 24 38                                     	mov    ecx,DWORD PTR [esp+0x38]
  5e8db9:	8b 54 24 48                                     	mov    edx,DWORD PTR [esp+0x48]
  5e8dbd:	8b 44 24 40                                     	mov    eax,DWORD PTR [esp+0x40]
  5e8dc1:	2b ca                                           	sub    ecx,edx
  5e8dc3:	2b c2                                           	sub    eax,edx
  5e8dc5:	2b c1                                           	sub    eax,ecx
  5e8dc7:	99                                              	cdq
  5e8dc8:	2b c2                                           	sub    eax,edx
  5e8dca:	d1 f8                                           	sar    eax,1
  5e8dcc:	8d 8c 08 3a ff ff ff                            	lea    ecx,[eax+ecx*1-0xc6]
  5e8dd3:	b8 e9 a2 8b 2e                                  	mov    eax,0x2e8ba2e9
  5e8dd8:	f7 e9                                           	imul   ecx
  5e8dda:	c1 fa 03                                        	sar    edx,0x3
  5e8ddd:	8b c2                                           	mov    eax,edx
  5e8ddf:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e8de3:	c1 e8 1f                                        	shr    eax,0x1f
  5e8de6:	03 d0                                           	add    edx,eax
  5e8de8:	8b 41 04                                        	mov    eax,DWORD PTR [ecx+0x4]
  5e8deb:	0f af d3                                        	imul   edx,ebx
  5e8dee:	03 d0                                           	add    edx,eax
  5e8df0:	eb 14                                           	jmp    0x5e8e06
  5e8df2:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  5e8df6:	8d 42 01                                        	lea    eax,[edx+0x1]
  5e8df9:	0f af f8                                        	imul   edi,eax
  5e8dfc:	03 7c 24 1c                                     	add    edi,DWORD PTR [esp+0x1c]
  5e8e00:	8b d7                                           	mov    edx,edi
  5e8e02:	8b 7c 24 20                                     	mov    edi,DWORD PTR [esp+0x20]
  5e8e06:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e8e0a:	6a 00                                           	push   0x0
  5e8e0c:	53                                              	push   ebx
  5e8e0d:	50                                              	push   eax
  5e8e0e:	52                                              	push   edx
  5e8e0f:	57                                              	push   edi
  5e8e10:	55                                              	push   ebp
  5e8e11:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e8e17:	5f                                              	pop    edi
  5e8e18:	5e                                              	pop    esi
  5e8e19:	5d                                              	pop    ebp
  5e8e1a:	5b                                              	pop    ebx
  5e8e1b:	83 c4 54                                        	add    esp,0x54
  5e8e1e:	c3                                              	ret
  5e8e1f:	90                                              	nop
  5e8e20:	83 ec 2c                                        	sub    esp,0x2c
  5e8e23:	53                                              	push   ebx
  5e8e24:	55                                              	push   ebp
  5e8e25:	56                                              	push   esi
  5e8e26:	8b e9                                           	mov    ebp,ecx
  5e8e28:	57                                              	push   edi
  5e8e29:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  5e8e2d:	55                                              	push   ebp
  5e8e2e:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e8e34:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e8e39:	8b f0                                           	mov    esi,eax
  5e8e3b:	e8 d0 a0 08 00                                  	call   0x672f10
  5e8e40:	8a d8                                           	mov    bl,al
  5e8e42:	8d 44 24 1c                                     	lea    eax,[esp+0x1c]
  5e8e46:	50                                              	push   eax
  5e8e47:	56                                              	push   esi
  5e8e48:	8b 35 98 a3 79 00                               	mov    esi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e8e4e:	ff d6                                           	call   esi
  5e8e50:	8d 4c 24 2c                                     	lea    ecx,[esp+0x2c]
  5e8e54:	51                                              	push   ecx
  5e8e55:	55                                              	push   ebp
  5e8e56:	ff d6                                           	call   esi
  5e8e58:	33 ff                                           	xor    edi,edi
  5e8e5a:	8b 4c 24 24                                     	mov    ecx,DWORD PTR [esp+0x24]
  5e8e5e:	8b 74 24 1c                                     	mov    esi,DWORD PTR [esp+0x1c]
  5e8e62:	8b c1                                           	mov    eax,ecx
  5e8e64:	89 7c 24 18                                     	mov    DWORD PTR [esp+0x18],edi
  5e8e68:	2b c6                                           	sub    eax,esi
  5e8e6a:	84 db                                           	test   bl,bl
  5e8e6c:	75 1c                                           	jne    0x5e8e8a
  5e8e6e:	2b 05 6c dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add6c
  5e8e74:	99                                              	cdq
  5e8e75:	2b c2                                           	sub    eax,edx
  5e8e77:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8e7c:	8b f0                                           	mov    esi,eax
  5e8e7e:	d1 fe                                           	sar    esi,1
  5e8e80:	0f 98 c2                                        	sets   dl
  5e8e83:	4a                                              	dec    edx
  5e8e84:	23 d6                                           	and    edx,esi
  5e8e86:	89 54 24 18                                     	mov    DWORD PTR [esp+0x18],edx
  5e8e8a:	8b 44 24 28                                     	mov    eax,DWORD PTR [esp+0x28]
  5e8e8e:	8b 74 24 20                                     	mov    esi,DWORD PTR [esp+0x20]
  5e8e92:	2b c6                                           	sub    eax,esi
  5e8e94:	89 7c 24 14                                     	mov    DWORD PTR [esp+0x14],edi
  5e8e98:	84 db                                           	test   bl,bl
  5e8e9a:	75 39                                           	jne    0x5e8ed5
  5e8e9c:	8b 35 78 dd 7a 00                               	mov    esi,DWORD PTR ds:0x7add78
  5e8ea2:	2b c6                                           	sub    eax,esi
  5e8ea4:	99                                              	cdq
  5e8ea5:	2b c2                                           	sub    eax,edx
  5e8ea7:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8eac:	d1 f8                                           	sar    eax,1
  5e8eae:	0f 98 c2                                        	sets   dl
  5e8eb1:	4a                                              	dec    edx
  5e8eb2:	23 d0                                           	and    edx,eax
  5e8eb4:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e8eb8:	8b fa                                           	mov    edi,edx
  5e8eba:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  5e8ebd:	2b c6                                           	sub    eax,esi
  5e8ebf:	99                                              	cdq
  5e8ec0:	2b c2                                           	sub    eax,edx
  5e8ec2:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8ec7:	d1 f8                                           	sar    eax,1
  5e8ec9:	0f 98 c2                                        	sets   dl
  5e8ecc:	4a                                              	dec    edx
  5e8ecd:	23 c2                                           	and    eax,edx
  5e8ecf:	2b f8                                           	sub    edi,eax
  5e8ed1:	89 7c 24 14                                     	mov    DWORD PTR [esp+0x14],edi
  5e8ed5:	8b 7c 24 34                                     	mov    edi,DWORD PTR [esp+0x34]
  5e8ed9:	8b 74 24 2c                                     	mov    esi,DWORD PTR [esp+0x2c]
  5e8edd:	8b 5c 24 38                                     	mov    ebx,DWORD PTR [esp+0x38]
  5e8ee1:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e8ee6:	2b fe                                           	sub    edi,esi
  5e8ee8:	8b 74 24 30                                     	mov    esi,DWORD PTR [esp+0x30]
  5e8eec:	2b de                                           	sub    ebx,esi
  5e8eee:	89 6c 24 10                                     	mov    DWORD PTR [esp+0x10],ebp
  5e8ef2:	85 c0                                           	test   eax,eax
  5e8ef4:	74 40                                           	je     0x5e8f36
  5e8ef6:	8d 4c 24 10                                     	lea    ecx,[esp+0x10]
  5e8efa:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e8f00:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e8f06:	ba 01 00 00 00                                  	mov    edx,0x1
  5e8f0b:	d3 e2                                           	shl    edx,cl
  5e8f0d:	4a                                              	dec    edx
  5e8f0e:	23 d0                                           	and    edx,eax
  5e8f10:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e8f15:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e8f18:	85 c0                                           	test   eax,eax
  5e8f1a:	74 12                                           	je     0x5e8f2e
  5e8f1c:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e8f20:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e8f22:	74 4f                                           	je     0x5e8f73
  5e8f24:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e8f2a:	85 c0                                           	test   eax,eax
  5e8f2c:	75 f2                                           	jne    0x5e8f20
  5e8f2e:	8b 4c 24 24                                     	mov    ecx,DWORD PTR [esp+0x24]
  5e8f32:	8b 74 24 30                                     	mov    esi,DWORD PTR [esp+0x30]
  5e8f36:	a1 80 dd 7a 00                                  	mov    eax,ds:0x7add80
  5e8f3b:	2b c7                                           	sub    eax,edi
  5e8f3d:	99                                              	cdq
  5e8f3e:	2b c2                                           	sub    eax,edx
  5e8f40:	d1 f8                                           	sar    eax,1
  5e8f42:	8b 54 24 14                                     	mov    edx,DWORD PTR [esp+0x14]
  5e8f46:	6a 00                                           	push   0x0
  5e8f48:	53                                              	push   ebx
  5e8f49:	8b 5c 24 28                                     	mov    ebx,DWORD PTR [esp+0x28]
  5e8f4d:	2b f3                                           	sub    esi,ebx
  5e8f4f:	2b c8                                           	sub    ecx,eax
  5e8f51:	57                                              	push   edi
  5e8f52:	03 f2                                           	add    esi,edx
  5e8f54:	2b cf                                           	sub    ecx,edi
  5e8f56:	8b 7c 24 24                                     	mov    edi,DWORD PTR [esp+0x24]
  5e8f5a:	56                                              	push   esi
  5e8f5b:	8b 74 24 2c                                     	mov    esi,DWORD PTR [esp+0x2c]
  5e8f5f:	2b cf                                           	sub    ecx,edi
  5e8f61:	2b ce                                           	sub    ecx,esi
  5e8f63:	51                                              	push   ecx
  5e8f64:	55                                              	push   ebp
  5e8f65:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e8f6b:	5f                                              	pop    edi
  5e8f6c:	5e                                              	pop    esi
  5e8f6d:	5d                                              	pop    ebp
  5e8f6e:	5b                                              	pop    ebx
  5e8f6f:	83 c4 2c                                        	add    esp,0x2c
  5e8f72:	c3                                              	ret
  5e8f73:	85 c0                                           	test   eax,eax
  5e8f75:	74 b7                                           	je     0x5e8f2e
  5e8f77:	83 c0 04                                        	add    eax,0x4
  5e8f7a:	85 c0                                           	test   eax,eax
  5e8f7c:	74 b0                                           	je     0x5e8f2e
  5e8f7e:	8b 80 dc 00 00 00                               	mov    eax,DWORD PTR [eax+0xdc]
  5e8f84:	85 c0                                           	test   eax,eax
  5e8f86:	74 a6                                           	je     0x5e8f2e
  5e8f88:	8b 4c 24 24                                     	mov    ecx,DWORD PTR [esp+0x24]
  5e8f8c:	8b 74 24 30                                     	mov    esi,DWORD PTR [esp+0x30]
  5e8f90:	eb b0                                           	jmp    0x5e8f42
  5e8f92:	90                                              	nop
  5e8f93:	90                                              	nop
  5e8f94:	90                                              	nop
  5e8f95:	90                                              	nop
  5e8f96:	90                                              	nop
  5e8f97:	90                                              	nop
  5e8f98:	90                                              	nop
  5e8f99:	90                                              	nop
  5e8f9a:	90                                              	nop
  5e8f9b:	90                                              	nop
  5e8f9c:	90                                              	nop
  5e8f9d:	90                                              	nop
  5e8f9e:	90                                              	nop
  5e8f9f:	90                                              	nop
  5e8fa0:	83 ec 24                                        	sub    esp,0x24
  5e8fa3:	53                                              	push   ebx
  5e8fa4:	55                                              	push   ebp
  5e8fa5:	56                                              	push   esi
  5e8fa6:	57                                              	push   edi
  5e8fa7:	8b f9                                           	mov    edi,ecx
  5e8fa9:	57                                              	push   edi
  5e8faa:	89 7c 24 14                                     	mov    DWORD PTR [esp+0x14],edi
  5e8fae:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e8fb4:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e8fb9:	8b f0                                           	mov    esi,eax
  5e8fbb:	e8 50 9f 08 00                                  	call   0x672f10
  5e8fc0:	8a d8                                           	mov    bl,al
  5e8fc2:	8d 44 24 14                                     	lea    eax,[esp+0x14]
  5e8fc6:	50                                              	push   eax
  5e8fc7:	56                                              	push   esi
  5e8fc8:	8b 35 98 a3 79 00                               	mov    esi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e8fce:	ff d6                                           	call   esi
  5e8fd0:	8d 4c 24 24                                     	lea    ecx,[esp+0x24]
  5e8fd4:	51                                              	push   ecx
  5e8fd5:	57                                              	push   edi
  5e8fd6:	ff d6                                           	call   esi
  5e8fd8:	8b 4c 24 1c                                     	mov    ecx,DWORD PTR [esp+0x1c]
  5e8fdc:	8b 74 24 14                                     	mov    esi,DWORD PTR [esp+0x14]
  5e8fe0:	8b c1                                           	mov    eax,ecx
  5e8fe2:	2b c6                                           	sub    eax,esi
  5e8fe4:	84 db                                           	test   bl,bl
  5e8fe6:	75 64                                           	jne    0x5e904c
  5e8fe8:	2b 05 6c dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add6c
  5e8fee:	99                                              	cdq
  5e8fef:	2b c2                                           	sub    eax,edx
  5e8ff1:	ba 00 00 00 00                                  	mov    edx,0x0
  5e8ff6:	d1 f8                                           	sar    eax,1
  5e8ff8:	0f 98 c2                                        	sets   dl
  5e8ffb:	4a                                              	dec    edx
  5e8ffc:	23 d0                                           	and    edx,eax
  5e8ffe:	a1 b8 10 ac 00                                  	mov    eax,ds:0xac10b8
  5e9003:	2b ca                                           	sub    ecx,edx
  5e9005:	0f bf 68 02                                     	movsx  ebp,WORD PTR [eax+0x2]
  5e9009:	0f bf 58 04                                     	movsx  ebx,WORD PTR [eax+0x4]
  5e900d:	a1 c8 11 ac 00                                  	mov    eax,ds:0xac11c8
  5e9012:	2b ce                                           	sub    ecx,esi
  5e9014:	81 e9 9c 00 00 00                               	sub    ecx,0x9c
  5e901a:	8b 70 04                                        	mov    esi,DWORD PTR [eax+0x4]
  5e901d:	8b 78 0c                                        	mov    edi,DWORD PTR [eax+0xc]
  5e9020:	a1 cc 11 ac 00                                  	mov    eax,ds:0xac11cc
  5e9025:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  5e9028:	2b c6                                           	sub    eax,esi
  5e902a:	99                                              	cdq
  5e902b:	f7 ff                                           	idiv   edi
  5e902d:	48                                              	dec    eax
  5e902e:	0f af c7                                        	imul   eax,edi
  5e9031:	8b 7c 24 10                                     	mov    edi,DWORD PTR [esp+0x10]
  5e9035:	03 c6                                           	add    eax,esi
  5e9037:	6a 00                                           	push   0x0
  5e9039:	53                                              	push   ebx
  5e903a:	55                                              	push   ebp
  5e903b:	50                                              	push   eax
  5e903c:	51                                              	push   ecx
  5e903d:	57                                              	push   edi
  5e903e:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9044:	5f                                              	pop    edi
  5e9045:	5e                                              	pop    esi
  5e9046:	5d                                              	pop    ebp
  5e9047:	5b                                              	pop    ebx
  5e9048:	83 c4 24                                        	add    esp,0x24
  5e904b:	c3                                              	ret
  5e904c:	a1 f8 0f ac 00                                  	mov    eax,ds:0xac0ff8
  5e9051:	8b 15 f0 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11f0
  5e9057:	2b ce                                           	sub    ecx,esi
  5e9059:	0f bf 58 04                                     	movsx  ebx,WORD PTR [eax+0x4]
  5e905d:	0f bf 68 02                                     	movsx  ebp,WORD PTR [eax+0x2]
  5e9061:	8b 42 04                                        	mov    eax,DWORD PTR [edx+0x4]
  5e9064:	81 e9 93 00 00 00                               	sub    ecx,0x93
  5e906a:	2b c3                                           	sub    eax,ebx
  5e906c:	eb c9                                           	jmp    0x5e9037
  5e906e:	90                                              	nop
  5e906f:	90                                              	nop
  5e9070:	83 ec 28                                        	sub    esp,0x28
  5e9073:	53                                              	push   ebx
  5e9074:	55                                              	push   ebp
  5e9075:	56                                              	push   esi
  5e9076:	57                                              	push   edi
  5e9077:	8b f9                                           	mov    edi,ecx
  5e9079:	57                                              	push   edi
  5e907a:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9080:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e9085:	8b f0                                           	mov    esi,eax
  5e9087:	e8 84 9e 08 00                                  	call   0x672f10
  5e908c:	8a d8                                           	mov    bl,al
  5e908e:	8d 44 24 18                                     	lea    eax,[esp+0x18]
  5e9092:	50                                              	push   eax
  5e9093:	56                                              	push   esi
  5e9094:	ff 15 b8 a4 79 00                               	call   DWORD PTR ds:0x79a4b8 ; USER32.dll!GetClientRect
  5e909a:	8d 4c 24 28                                     	lea    ecx,[esp+0x28]
  5e909e:	51                                              	push   ecx
  5e909f:	57                                              	push   edi
  5e90a0:	ff 15 98 a3 79 00                               	call   DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e90a6:	8b 74 24 18                                     	mov    esi,DWORD PTR [esp+0x18]
  5e90aa:	8b 4c 24 20                                     	mov    ecx,DWORD PTR [esp+0x20]
  5e90ae:	c7 44 24 14 00 00 00 00                         	mov    DWORD PTR [esp+0x14],0x0
  5e90b6:	8b c1                                           	mov    eax,ecx
  5e90b8:	2b c6                                           	sub    eax,esi
  5e90ba:	84 db                                           	test   bl,bl
  5e90bc:	75 1a                                           	jne    0x5e90d8
  5e90be:	2b 05 6c dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add6c
  5e90c4:	99                                              	cdq
  5e90c5:	2b c2                                           	sub    eax,edx
  5e90c7:	ba 00 00 00 00                                  	mov    edx,0x0
  5e90cc:	d1 f8                                           	sar    eax,1
  5e90ce:	0f 98 c2                                        	sets   dl
  5e90d1:	4a                                              	dec    edx
  5e90d2:	23 d0                                           	and    edx,eax
  5e90d4:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  5e90d8:	8b 74 24 30                                     	mov    esi,DWORD PTR [esp+0x30]
  5e90dc:	8b 6c 24 28                                     	mov    ebp,DWORD PTR [esp+0x28]
  5e90e0:	8b 54 24 2c                                     	mov    edx,DWORD PTR [esp+0x2c]
  5e90e4:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e90e9:	2b f5                                           	sub    esi,ebp
  5e90eb:	8b 6c 24 34                                     	mov    ebp,DWORD PTR [esp+0x34]
  5e90ef:	2b ea                                           	sub    ebp,edx
  5e90f1:	89 7c 24 10                                     	mov    DWORD PTR [esp+0x10],edi
  5e90f5:	85 c0                                           	test   eax,eax
  5e90f7:	74 3c                                           	je     0x5e9135
  5e90f9:	8d 4c 24 10                                     	lea    ecx,[esp+0x10]
  5e90fd:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e9103:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e9109:	ba 01 00 00 00                                  	mov    edx,0x1
  5e910e:	d3 e2                                           	shl    edx,cl
  5e9110:	4a                                              	dec    edx
  5e9111:	23 d0                                           	and    edx,eax
  5e9113:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e9118:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e911b:	85 c0                                           	test   eax,eax
  5e911d:	74 12                                           	je     0x5e9131
  5e911f:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e9123:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e9125:	74 39                                           	je     0x5e9160
  5e9127:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e912d:	85 c0                                           	test   eax,eax
  5e912f:	75 f2                                           	jne    0x5e9123
  5e9131:	8b 4c 24 20                                     	mov    ecx,DWORD PTR [esp+0x20]
  5e9135:	a1 80 dd 7a 00                                  	mov    eax,ds:0x7add80
  5e913a:	2b c6                                           	sub    eax,esi
  5e913c:	99                                              	cdq
  5e913d:	2b c2                                           	sub    eax,edx
  5e913f:	d1 f8                                           	sar    eax,1
  5e9141:	8b 54 24 18                                     	mov    edx,DWORD PTR [esp+0x18]
  5e9145:	2b c8                                           	sub    ecx,eax
  5e9147:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e914b:	2b ce                                           	sub    ecx,esi
  5e914d:	2b c8                                           	sub    ecx,eax
  5e914f:	2b ca                                           	sub    ecx,edx
  5e9151:	84 db                                           	test   bl,bl
  5e9153:	74 26                                           	je     0x5e917b
  5e9155:	8b 15 f4 11 ac 00                               	mov    edx,DWORD PTR ds:0xac11f4
  5e915b:	8b 42 04                                        	mov    eax,DWORD PTR [edx+0x4]
  5e915e:	eb 23                                           	jmp    0x5e9183
  5e9160:	85 c0                                           	test   eax,eax
  5e9162:	74 cd                                           	je     0x5e9131
  5e9164:	83 c0 04                                        	add    eax,0x4
  5e9167:	85 c0                                           	test   eax,eax
  5e9169:	74 c6                                           	je     0x5e9131
  5e916b:	8b 80 dc 00 00 00                               	mov    eax,DWORD PTR [eax+0xdc]
  5e9171:	85 c0                                           	test   eax,eax
  5e9173:	74 bc                                           	je     0x5e9131
  5e9175:	8b 4c 24 20                                     	mov    ecx,DWORD PTR [esp+0x20]
  5e9179:	eb c6                                           	jmp    0x5e9141
  5e917b:	a1 cc 11 ac 00                                  	mov    eax,ds:0xac11cc
  5e9180:	8b 40 04                                        	mov    eax,DWORD PTR [eax+0x4]
  5e9183:	6a 00                                           	push   0x0
  5e9185:	2b c5                                           	sub    eax,ebp
  5e9187:	55                                              	push   ebp
  5e9188:	56                                              	push   esi
  5e9189:	50                                              	push   eax
  5e918a:	51                                              	push   ecx
  5e918b:	57                                              	push   edi
  5e918c:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9192:	5f                                              	pop    edi
  5e9193:	5e                                              	pop    esi
  5e9194:	5d                                              	pop    ebp
  5e9195:	5b                                              	pop    ebx
  5e9196:	83 c4 28                                        	add    esp,0x28
  5e9199:	c3                                              	ret
  5e919a:	90                                              	nop
  5e919b:	90                                              	nop
  5e919c:	90                                              	nop
  5e919d:	90                                              	nop
  5e919e:	90                                              	nop
  5e919f:	90                                              	nop
  5e91a0:	83 ec 20                                        	sub    esp,0x20
  5e91a3:	53                                              	push   ebx
  5e91a4:	55                                              	push   ebp
  5e91a5:	56                                              	push   esi
  5e91a6:	8b f1                                           	mov    esi,ecx
  5e91a8:	57                                              	push   edi
  5e91a9:	56                                              	push   esi
  5e91aa:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e91b0:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e91b5:	8b f8                                           	mov    edi,eax
  5e91b7:	e8 54 9d 08 00                                  	call   0x672f10
  5e91bc:	8a d8                                           	mov    bl,al
  5e91be:	8d 44 24 10                                     	lea    eax,[esp+0x10]
  5e91c2:	50                                              	push   eax
  5e91c3:	57                                              	push   edi
  5e91c4:	ff 15 b8 a4 79 00                               	call   DWORD PTR ds:0x79a4b8 ; USER32.dll!GetClientRect
  5e91ca:	8d 4c 24 20                                     	lea    ecx,[esp+0x20]
  5e91ce:	51                                              	push   ecx
  5e91cf:	56                                              	push   esi
  5e91d0:	ff 15 98 a3 79 00                               	call   DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e91d6:	8b 6c 24 10                                     	mov    ebp,DWORD PTR [esp+0x10]
  5e91da:	33 ff                                           	xor    edi,edi
  5e91dc:	8b 44 24 18                                     	mov    eax,DWORD PTR [esp+0x18]
  5e91e0:	2b c5                                           	sub    eax,ebp
  5e91e2:	84 db                                           	test   bl,bl
  5e91e4:	75 18                                           	jne    0x5e91fe
  5e91e6:	2b 05 6c dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add6c
  5e91ec:	99                                              	cdq
  5e91ed:	2b c2                                           	sub    eax,edx
  5e91ef:	ba 00 00 00 00                                  	mov    edx,0x0
  5e91f4:	d1 f8                                           	sar    eax,1
  5e91f6:	0f 98 c2                                        	sets   dl
  5e91f9:	4a                                              	dec    edx
  5e91fa:	23 d0                                           	and    edx,eax
  5e91fc:	8b fa                                           	mov    edi,edx
  5e91fe:	8b 4c 24 1c                                     	mov    ecx,DWORD PTR [esp+0x1c]
  5e9202:	8b 54 24 14                                     	mov    edx,DWORD PTR [esp+0x14]
  5e9206:	8b c1                                           	mov    eax,ecx
  5e9208:	2b c2                                           	sub    eax,edx
  5e920a:	33 d2                                           	xor    edx,edx
  5e920c:	84 db                                           	test   bl,bl
  5e920e:	75 16                                           	jne    0x5e9226
  5e9210:	2b 05 78 dd 7a 00                               	sub    eax,DWORD PTR ds:0x7add78
  5e9216:	99                                              	cdq
  5e9217:	2b c2                                           	sub    eax,edx
  5e9219:	ba 00 00 00 00                                  	mov    edx,0x0
  5e921e:	d1 f8                                           	sar    eax,1
  5e9220:	0f 98 c2                                        	sets   dl
  5e9223:	4a                                              	dec    edx
  5e9224:	23 d0                                           	and    edx,eax
  5e9226:	8b 44 24 2c                                     	mov    eax,DWORD PTR [esp+0x2c]
  5e922a:	8b 5c 24 24                                     	mov    ebx,DWORD PTR [esp+0x24]
  5e922e:	2b c3                                           	sub    eax,ebx
  5e9230:	8b 5c 24 28                                     	mov    ebx,DWORD PTR [esp+0x28]
  5e9234:	2b 5c 24 20                                     	sub    ebx,DWORD PTR [esp+0x20]
  5e9238:	2b c8                                           	sub    ecx,eax
  5e923a:	2b ca                                           	sub    ecx,edx
  5e923c:	6a 00                                           	push   0x0
  5e923e:	50                                              	push   eax
  5e923f:	49                                              	dec    ecx
  5e9240:	53                                              	push   ebx
  5e9241:	8d 44 2f 0a                                     	lea    eax,[edi+ebp*1+0xa]
  5e9245:	51                                              	push   ecx
  5e9246:	50                                              	push   eax
  5e9247:	56                                              	push   esi
  5e9248:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e924e:	5f                                              	pop    edi
  5e924f:	5e                                              	pop    esi
  5e9250:	5d                                              	pop    ebp
  5e9251:	5b                                              	pop    ebx
  5e9252:	83 c4 20                                        	add    esp,0x20
  5e9255:	c3                                              	ret
  5e9256:	90                                              	nop
  5e9257:	90                                              	nop
  5e9258:	90                                              	nop
  5e9259:	90                                              	nop
  5e925a:	90                                              	nop
  5e925b:	90                                              	nop
  5e925c:	90                                              	nop
  5e925d:	90                                              	nop
  5e925e:	90                                              	nop
  5e925f:	90                                              	nop

; 0x5e9410 <= VA < 0x5e9ba2: Post-placement adjustment: our battle titles bypass extra shell adjustments; other relevant IDs do not match special cases.
  5e9410:	83 ec 3c                                        	sub    esp,0x3c
  5e9413:	53                                              	push   ebx
  5e9414:	55                                              	push   ebp
  5e9415:	56                                              	push   esi
  5e9416:	8b d9                                           	mov    ebx,ecx
  5e9418:	57                                              	push   edi
  5e9419:	53                                              	push   ebx
  5e941a:	89 5c 24 28                                     	mov    DWORD PTR [esp+0x28],ebx
  5e941e:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9424:	8b 3d 98 a3 79 00                               	mov    edi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e942a:	8b f0                                           	mov    esi,eax
  5e942c:	8d 44 24 3c                                     	lea    eax,[esp+0x3c]
  5e9430:	50                                              	push   eax
  5e9431:	56                                              	push   esi
  5e9432:	ff d7                                           	call   edi
  5e9434:	8d 4c 24 2c                                     	lea    ecx,[esp+0x2c]
  5e9438:	51                                              	push   ecx
  5e9439:	53                                              	push   ebx
  5e943a:	ff d7                                           	call   edi
  5e943c:	8b 6c 24 3c                                     	mov    ebp,DWORD PTR [esp+0x3c]
  5e9440:	8b 5c 24 40                                     	mov    ebx,DWORD PTR [esp+0x40]
  5e9444:	8b 44 24 2c                                     	mov    eax,DWORD PTR [esp+0x2c]
  5e9448:	89 74 24 20                                     	mov    DWORD PTR [esp+0x20],esi
  5e944c:	8b c8                                           	mov    ecx,eax
  5e944e:	2b cd                                           	sub    ecx,ebp
  5e9450:	89 4c 24 18                                     	mov    DWORD PTR [esp+0x18],ecx
  5e9454:	8b 4c 24 30                                     	mov    ecx,DWORD PTR [esp+0x30]
  5e9458:	8b d1                                           	mov    edx,ecx
  5e945a:	2b d3                                           	sub    edx,ebx
  5e945c:	89 54 24 10                                     	mov    DWORD PTR [esp+0x10],edx
  5e9460:	8b 54 24 34                                     	mov    edx,DWORD PTR [esp+0x34]
  5e9464:	2b d0                                           	sub    edx,eax
  5e9466:	8b 44 24 38                                     	mov    eax,DWORD PTR [esp+0x38]
  5e946a:	2b c1                                           	sub    eax,ecx
  5e946c:	89 54 24 14                                     	mov    DWORD PTR [esp+0x14],edx
  5e9470:	89 44 24 1c                                     	mov    DWORD PTR [esp+0x1c],eax
  5e9474:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e9479:	85 c0                                           	test   eax,eax
  5e947b:	74 3c                                           	je     0x5e94b9
  5e947d:	8d 4c 24 20                                     	lea    ecx,[esp+0x20]
  5e9481:	ff 15 58 36 a7 00                               	call   DWORD PTR ds:0xa73658
  5e9487:	8b 0d 4c 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa7364c
  5e948d:	ba 01 00 00 00                                  	mov    edx,0x1
  5e9492:	d3 e2                                           	shl    edx,cl
  5e9494:	4a                                              	dec    edx
  5e9495:	23 d0                                           	and    edx,eax
  5e9497:	a1 40 36 a7 00                                  	mov    eax,ds:0xa73640
  5e949c:	8b 04 90                                        	mov    eax,DWORD PTR [eax+edx*4]
  5e949f:	85 c0                                           	test   eax,eax
  5e94a1:	74 16                                           	je     0x5e94b9
  5e94a3:	8b 4c 24 20                                     	mov    ecx,DWORD PTR [esp+0x20]
  5e94a7:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e94a9:	0f 84 0d 03 00 00                               	je     0x5e97bc
  5e94af:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e94b5:	85 c0                                           	test   eax,eax
  5e94b7:	75 ee                                           	jne    0x5e94a7
  5e94b9:	33 f6                                           	xor    esi,esi
  5e94bb:	8b 4c 24 24                                     	mov    ecx,DWORD PTR [esp+0x24]
  5e94bf:	51                                              	push   ecx
  5e94c0:	ff 15 f4 a3 79 00                               	call   DWORD PTR ds:0x79a3f4 ; USER32.dll!GetDlgCtrlID
  5e94c6:	8b f8                                           	mov    edi,eax
  5e94c8:	81 fe 0c 01 00 00                               	cmp    esi,0x10c
  5e94ce:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  5e94d2:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5e94d6:	8b 6c 24 18                                     	mov    ebp,DWORD PTR [esp+0x18]
  5e94da:	8b 5c 24 14                                     	mov    ebx,DWORD PTR [esp+0x14]
  5e94de:	89 54 24 20                                     	mov    DWORD PTR [esp+0x20],edx
  5e94e2:	89 44 24 28                                     	mov    DWORD PTR [esp+0x28],eax
  5e94e6:	0f 84 35 01 00 00                               	je     0x5e9621
  5e94ec:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e94f2:	0f 84 29 01 00 00                               	je     0x5e9621
  5e94f8:	81 fe a3 00 00 00                               	cmp    esi,0xa3
  5e94fe:	0f 84 1d 01 00 00                               	je     0x5e9621
  5e9504:	83 fe 73                                        	cmp    esi,0x73
  5e9507:	0f 84 14 01 00 00                               	je     0x5e9621
  5e950d:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e9513:	0f 84 08 01 00 00                               	je     0x5e9621
  5e9519:	81 fe bb 0b 00 00                               	cmp    esi,0xbbb
  5e951f:	0f 84 fc 00 00 00                               	je     0x5e9621
  5e9525:	81 fe f5 00 00 00                               	cmp    esi,0xf5
  5e952b:	0f 84 f0 00 00 00                               	je     0x5e9621
  5e9531:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e9537:	0f 84 e4 00 00 00                               	je     0x5e9621
  5e953d:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e9543:	0f 84 d8 00 00 00                               	je     0x5e9621
  5e9549:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e954f:	0f 84 cc 00 00 00                               	je     0x5e9621
  5e9555:	81 fe b5 02 00 00                               	cmp    esi,0x2b5
  5e955b:	0f 84 c0 00 00 00                               	je     0x5e9621
  5e9561:	81 fe b7 00 00 00                               	cmp    esi,0xb7
  5e9567:	0f 84 b4 00 00 00                               	je     0x5e9621
  5e956d:	81 fe b4 02 00 00                               	cmp    esi,0x2b4
  5e9573:	0f 84 a8 00 00 00                               	je     0x5e9621
  5e9579:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e957f:	0f 84 9c 00 00 00                               	je     0x5e9621
  5e9585:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e958b:	0f 84 90 00 00 00                               	je     0x5e9621
  5e9591:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e9597:	0f 84 84 00 00 00                               	je     0x5e9621
  5e959d:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e95a3:	74 7c                                           	je     0x5e9621
  5e95a5:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e95ab:	74 74                                           	je     0x5e9621
  5e95ad:	81 fe 08 01 00 00                               	cmp    esi,0x108
  5e95b3:	74 6c                                           	je     0x5e9621
  5e95b5:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e95bb:	74 64                                           	je     0x5e9621
  5e95bd:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e95c3:	74 5c                                           	je     0x5e9621
  5e95c5:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e95cb:	74 54                                           	je     0x5e9621
  5e95cd:	81 fe b5 00 00 00                               	cmp    esi,0xb5
  5e95d3:	74 4c                                           	je     0x5e9621
  5e95d5:	81 fe ba 0b 00 00                               	cmp    esi,0xbba
  5e95db:	74 44                                           	je     0x5e9621
  5e95dd:	81 fe ff 00 00 00                               	cmp    esi,0xff
  5e95e3:	74 3c                                           	je     0x5e9621
  5e95e5:	83 fe 6b                                        	cmp    esi,0x6b
  5e95e8:	74 37                                           	je     0x5e9621
  5e95ea:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e95f0:	74 2f                                           	je     0x5e9621
  5e95f2:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e95f8:	74 27                                           	je     0x5e9621
  5e95fa:	81 fe b8 00 00 00                               	cmp    esi,0xb8
  5e9600:	74 1f                                           	je     0x5e9621
  5e9602:	81 fe d6 00 00 00                               	cmp    esi,0xd6
  5e9608:	74 17                                           	je     0x5e9621
  5e960a:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e9610:	74 0f                                           	je     0x5e9621
  5e9612:	8b ce                                           	mov    ecx,esi
  5e9614:	e8 87 77 ff ff                                  	call   0x5e0da0
  5e9619:	84 c0                                           	test   al,al
  5e961b:	0f 84 a9 02 00 00                               	je     0x5e98ca
  5e9621:	81 ff 94 06 00 00                               	cmp    edi,0x694
  5e9627:	0f 85 9d 02 00 00                               	jne    0x5e98ca
  5e962d:	81 fe 0c 01 00 00                               	cmp    esi,0x10c
  5e9633:	0f 84 2a 01 00 00                               	je     0x5e9763
  5e9639:	81 fe 94 00 00 00                               	cmp    esi,0x94
  5e963f:	0f 84 1e 01 00 00                               	je     0x5e9763
  5e9645:	81 fe a3 00 00 00                               	cmp    esi,0xa3
  5e964b:	0f 84 12 01 00 00                               	je     0x5e9763
  5e9651:	83 fe 73                                        	cmp    esi,0x73
  5e9654:	0f 84 09 01 00 00                               	je     0x5e9763
  5e965a:	81 fe d8 00 00 00                               	cmp    esi,0xd8
  5e9660:	0f 84 fd 00 00 00                               	je     0x5e9763
  5e9666:	81 fe bb 0b 00 00                               	cmp    esi,0xbbb
  5e966c:	0f 84 f1 00 00 00                               	je     0x5e9763
  5e9672:	81 fe f5 00 00 00                               	cmp    esi,0xf5
  5e9678:	0f 84 e5 00 00 00                               	je     0x5e9763
  5e967e:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e9684:	0f 84 d9 00 00 00                               	je     0x5e9763
  5e968a:	81 fe e2 00 00 00                               	cmp    esi,0xe2
  5e9690:	0f 84 cd 00 00 00                               	je     0x5e9763
  5e9696:	81 fe d5 00 00 00                               	cmp    esi,0xd5
  5e969c:	0f 84 c1 00 00 00                               	je     0x5e9763
  5e96a2:	81 fe b5 02 00 00                               	cmp    esi,0x2b5
  5e96a8:	0f 84 b5 00 00 00                               	je     0x5e9763
  5e96ae:	81 fe b7 00 00 00                               	cmp    esi,0xb7
  5e96b4:	0f 84 a9 00 00 00                               	je     0x5e9763
  5e96ba:	81 fe b4 02 00 00                               	cmp    esi,0x2b4
  5e96c0:	0f 84 9d 00 00 00                               	je     0x5e9763
  5e96c6:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e96cc:	0f 84 91 00 00 00                               	je     0x5e9763
  5e96d2:	81 fe 01 01 00 00                               	cmp    esi,0x101
  5e96d8:	0f 84 85 00 00 00                               	je     0x5e9763
  5e96de:	81 fe 29 01 00 00                               	cmp    esi,0x129
  5e96e4:	74 7d                                           	je     0x5e9763
  5e96e6:	81 fe c6 0b 00 00                               	cmp    esi,0xbc6
  5e96ec:	74 75                                           	je     0x5e9763
  5e96ee:	81 fe d7 00 00 00                               	cmp    esi,0xd7
  5e96f4:	74 6d                                           	je     0x5e9763
  5e96f6:	81 fe 08 01 00 00                               	cmp    esi,0x108
  5e96fc:	74 65                                           	je     0x5e9763
  5e96fe:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e9704:	0f 84 96 00 00 00                               	je     0x5e97a0
  5e970a:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e9710:	74 51                                           	je     0x5e9763
  5e9712:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e9718:	74 49                                           	je     0x5e9763
  5e971a:	81 fe b5 00 00 00                               	cmp    esi,0xb5
  5e9720:	74 41                                           	je     0x5e9763
  5e9722:	81 fe ba 0b 00 00                               	cmp    esi,0xbba
  5e9728:	74 39                                           	je     0x5e9763
  5e972a:	81 fe ff 00 00 00                               	cmp    esi,0xff
  5e9730:	74 31                                           	je     0x5e9763
  5e9732:	83 fe 6b                                        	cmp    esi,0x6b
  5e9735:	74 2c                                           	je     0x5e9763
  5e9737:	81 fe 00 01 00 00                               	cmp    esi,0x100
  5e973d:	74 24                                           	je     0x5e9763
  5e973f:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e9745:	74 1c                                           	je     0x5e9763
  5e9747:	81 fe b8 00 00 00                               	cmp    esi,0xb8
  5e974d:	74 14                                           	je     0x5e9763
  5e974f:	81 fe d6 00 00 00                               	cmp    esi,0xd6
  5e9755:	74 0c                                           	je     0x5e9763
  5e9757:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e975d:	0f 85 9f 00 00 00                               	jne    0x5e9802
  5e9763:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e9769:	74 35                                           	je     0x5e97a0
  5e976b:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e9771:	74 2d                                           	je     0x5e97a0
  5e9773:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e9779:	74 25                                           	je     0x5e97a0
  5e977b:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e9781:	74 1d                                           	je     0x5e97a0
  5e9783:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e9789:	74 15                                           	je     0x5e97a0
  5e978b:	81 fe 05 01 00 00                               	cmp    esi,0x105
  5e9791:	74 0d                                           	je     0x5e97a0
  5e9793:	83 fe 6b                                        	cmp    esi,0x6b
  5e9796:	74 08                                           	je     0x5e97a0
  5e9798:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e979e:	75 37                                           	jne    0x5e97d7
  5e97a0:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e97a5:	e8 66 97 08 00                                  	call   0x672f10
  5e97aa:	84 c0                                           	test   al,al
  5e97ac:	0f 85 e8 03 00 00                               	jne    0x5e9b9a
  5e97b2:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e97b6:	40                                              	inc    eax
  5e97b7:	e9 a1 03 00 00                                  	jmp    0x5e9b5d
  5e97bc:	85 c0                                           	test   eax,eax
  5e97be:	0f 84 f5 fc ff ff                               	je     0x5e94b9
  5e97c4:	83 c0 04                                        	add    eax,0x4
  5e97c7:	85 c0                                           	test   eax,eax
  5e97c9:	0f 84 ea fc ff ff                               	je     0x5e94b9
  5e97cf:	8b 70 6c                                        	mov    esi,DWORD PTR [eax+0x6c]
  5e97d2:	e9 e4 fc ff ff                                  	jmp    0x5e94bb
  5e97d7:	b9 98 d2 a3 00                                  	mov    ecx,0xa3d298
  5e97dc:	e8 2f 97 08 00                                  	call   0x672f10
  5e97e1:	84 c0                                           	test   al,al
  5e97e3:	0f 85 b1 03 00 00                               	jne    0x5e9b9a
  5e97e9:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e97ed:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5e97f1:	83 c1 07                                        	add    ecx,0x7
  5e97f4:	40                                              	inc    eax
  5e97f5:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  5e97f9:	89 44 24 1c                                     	mov    DWORD PTR [esp+0x1c],eax
  5e97fd:	e9 5f 03 00 00                                  	jmp    0x5e9b61
  5e9802:	81 fe 25 01 00 00                               	cmp    esi,0x125
  5e9808:	0f 84 8c 00 00 00                               	je     0x5e989a
  5e980e:	81 fe e7 00 00 00                               	cmp    esi,0xe7
  5e9814:	0f 84 80 00 00 00                               	je     0x5e989a
  5e981a:	81 fe 16 01 00 00                               	cmp    esi,0x116
  5e9820:	74 78                                           	je     0x5e989a
  5e9822:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e9828:	0f 84 6c 03 00 00                               	je     0x5e9b9a
  5e982e:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e9834:	74 64                                           	je     0x5e989a
  5e9836:	81 fe 1d 01 00 00                               	cmp    esi,0x11d
  5e983c:	74 5c                                           	je     0x5e989a
  5e983e:	81 fe 1c 01 00 00                               	cmp    esi,0x11c
  5e9844:	74 54                                           	je     0x5e989a
  5e9846:	81 fe 14 01 00 00                               	cmp    esi,0x114
  5e984c:	74 4c                                           	je     0x5e989a
  5e984e:	81 fe bc 02 00 00                               	cmp    esi,0x2bc
  5e9854:	74 44                                           	je     0x5e989a
  5e9856:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e985c:	74 3c                                           	je     0x5e989a
  5e985e:	81 fe 09 01 00 00                               	cmp    esi,0x109
  5e9864:	74 34                                           	je     0x5e989a
  5e9866:	81 fe 0f 01 00 00                               	cmp    esi,0x10f
  5e986c:	74 2c                                           	je     0x5e989a
  5e986e:	81 fe 17 01 00 00                               	cmp    esi,0x117
  5e9874:	74 24                                           	je     0x5e989a
  5e9876:	81 fe e6 00 00 00                               	cmp    esi,0xe6
  5e987c:	74 1c                                           	je     0x5e989a
  5e987e:	81 fe f3 00 00 00                               	cmp    esi,0xf3
  5e9884:	74 14                                           	je     0x5e989a
  5e9886:	81 fe f4 00 00 00                               	cmp    esi,0xf4
  5e988c:	74 0c                                           	je     0x5e989a
  5e988e:	81 fe 0e 01 00 00                               	cmp    esi,0x10e
  5e9894:	0f 85 00 03 00 00                               	jne    0x5e9b9a
  5e989a:	81 fe c2 00 00 00                               	cmp    esi,0xc2
  5e98a0:	0f 84 f4 02 00 00                               	je     0x5e9b9a
  5e98a6:	81 fe c9 00 00 00                               	cmp    esi,0xc9
  5e98ac:	0f 84 e8 02 00 00                               	je     0x5e9b9a
  5e98b2:	81 fe 13 01 00 00                               	cmp    esi,0x113
  5e98b8:	0f 84 dc 02 00 00                               	je     0x5e9b9a
  5e98be:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e98c2:	83 c0 02                                        	add    eax,0x2
  5e98c5:	e9 93 02 00 00                                  	jmp    0x5e9b5d
  5e98ca:	81 fe 02 01 00 00                               	cmp    esi,0x102
  5e98d0:	75 41                                           	jne    0x5e9913
  5e98d2:	81 ff 0c 05 00 00                               	cmp    edi,0x50c
  5e98d8:	0f 84 7a 02 00 00                               	je     0x5e9b58
  5e98de:	81 ff 4e 05 00 00                               	cmp    edi,0x54e
  5e98e4:	0f 84 59 02 00 00                               	je     0x5e9b43
  5e98ea:	81 ff 93 06 00 00                               	cmp    edi,0x693
  5e98f0:	0f 84 4d 02 00 00                               	je     0x5e9b43
  5e98f6:	81 ff 96 06 00 00                               	cmp    edi,0x696
  5e98fc:	0f 84 41 02 00 00                               	je     0x5e9b43
  5e9902:	81 ff 9a 06 00 00                               	cmp    edi,0x69a
  5e9908:	0f 85 8c 02 00 00                               	jne    0x5e9b9a
  5e990e:	e9 30 02 00 00                                  	jmp    0x5e9b43
  5e9913:	81 fe bb 00 00 00                               	cmp    esi,0xbb
  5e9919:	75 25                                           	jne    0x5e9940
  5e991b:	81 ff 40 05 00 00                               	cmp    edi,0x540
  5e9921:	0f 85 73 02 00 00                               	jne    0x5e9b9a
  5e9927:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e992b:	48                                              	dec    eax
  5e992c:	3b c3                                           	cmp    eax,ebx
  5e992e:	89 44 24 14                                     	mov    DWORD PTR [esp+0x14],eax
  5e9932:	0f 85 41 02 00 00                               	jne    0x5e9b79
  5e9938:	5f                                              	pop    edi
  5e9939:	5e                                              	pop    esi
  5e993a:	5d                                              	pop    ebp
  5e993b:	5b                                              	pop    ebx
  5e993c:	83 c4 3c                                        	add    esp,0x3c
  5e993f:	c3                                              	ret
  5e9940:	81 fe bc 00 00 00                               	cmp    esi,0xbc
  5e9946:	0f 84 bd 01 00 00                               	je     0x5e9b09
  5e994c:	81 fe bd 00 00 00                               	cmp    esi,0xbd
  5e9952:	0f 84 b1 01 00 00                               	je     0x5e9b09
  5e9958:	81 fe 03 01 00 00                               	cmp    esi,0x103
  5e995e:	75 7a                                           	jne    0x5e99da
  5e9960:	81 ff f3 06 00 00                               	cmp    edi,0x6f3
  5e9966:	74 3c                                           	je     0x5e99a4
  5e9968:	81 ff f4 06 00 00                               	cmp    edi,0x6f4
  5e996e:	74 34                                           	je     0x5e99a4
  5e9970:	81 ff 9f 06 00 00                               	cmp    edi,0x69f
  5e9976:	74 2c                                           	je     0x5e99a4
  5e9978:	81 ff f6 06 00 00                               	cmp    edi,0x6f6
  5e997e:	74 24                                           	je     0x5e99a4
  5e9980:	81 ff ef 06 00 00                               	cmp    edi,0x6ef
  5e9986:	74 1c                                           	je     0x5e99a4
  5e9988:	81 ff f1 06 00 00                               	cmp    edi,0x6f1
  5e998e:	74 14                                           	je     0x5e99a4
  5e9990:	81 ff f0 06 00 00                               	cmp    edi,0x6f0
  5e9996:	74 0c                                           	je     0x5e99a4
  5e9998:	81 ff f2 06 00 00                               	cmp    edi,0x6f2
  5e999e:	0f 85 f6 01 00 00                               	jne    0x5e9b9a
  5e99a4:	8b 0d e0 23 85 00                               	mov    ecx,DWORD PTR ds:0x8523e0
  5e99aa:	a1 6c dd 7a 00                                  	mov    eax,ds:0x7add6c
  5e99af:	3b c8                                           	cmp    ecx,eax
  5e99b1:	0f 8c e3 01 00 00                               	jl     0x5e9b9a
  5e99b7:	a1 78 dd 7a 00                                  	mov    eax,ds:0x7add78
  5e99bc:	8b 1d 74 dd 7a 00                               	mov    ebx,DWORD PTR ds:0x7add74
  5e99c2:	2b c3                                           	sub    eax,ebx
  5e99c4:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e99c8:	99                                              	cdq
  5e99c9:	2b c2                                           	sub    eax,edx
  5e99cb:	d1 f8                                           	sar    eax,1
  5e99cd:	f7 d8                                           	neg    eax
  5e99cf:	03 c8                                           	add    ecx,eax
  5e99d1:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  5e99d5:	e9 87 01 00 00                                  	jmp    0x5e9b61
  5e99da:	81 fe c7 0b 00 00                               	cmp    esi,0xbc7
  5e99e0:	0f 85 b4 01 00 00                               	jne    0x5e9b9a
  5e99e6:	81 ff 33 07 00 00                               	cmp    edi,0x733
  5e99ec:	0f 84 e4 00 00 00                               	je     0x5e9ad6
  5e99f2:	81 ff 35 07 00 00                               	cmp    edi,0x735
  5e99f8:	0f 84 d8 00 00 00                               	je     0x5e9ad6
  5e99fe:	81 ff 32 07 00 00                               	cmp    edi,0x732
  5e9a04:	0f 84 cc 00 00 00                               	je     0x5e9ad6
  5e9a0a:	81 ff ea 03 00 00                               	cmp    edi,0x3ea
  5e9a10:	0f 84 c0 00 00 00                               	je     0x5e9ad6
  5e9a16:	81 ff 3c 07 00 00                               	cmp    edi,0x73c
  5e9a1c:	0f 84 b4 00 00 00                               	je     0x5e9ad6
  5e9a22:	81 ff 11 04 00 00                               	cmp    edi,0x411
  5e9a28:	0f 84 a8 00 00 00                               	je     0x5e9ad6
  5e9a2e:	81 ff 12 04 00 00                               	cmp    edi,0x412
  5e9a34:	0f 84 9c 00 00 00                               	je     0x5e9ad6
  5e9a3a:	81 ff 3d 07 00 00                               	cmp    edi,0x73d
  5e9a40:	0f 84 90 00 00 00                               	je     0x5e9ad6
  5e9a46:	81 ff 19 04 00 00                               	cmp    edi,0x419
  5e9a4c:	0f 84 84 00 00 00                               	je     0x5e9ad6
  5e9a52:	81 ff 1a 04 00 00                               	cmp    edi,0x41a
  5e9a58:	74 7c                                           	je     0x5e9ad6
  5e9a5a:	81 ff 3e 07 00 00                               	cmp    edi,0x73e
  5e9a60:	74 74                                           	je     0x5e9ad6
  5e9a62:	81 ff a3 06 00 00                               	cmp    edi,0x6a3
  5e9a68:	74 6c                                           	je     0x5e9ad6
  5e9a6a:	81 ff a4 06 00 00                               	cmp    edi,0x6a4
  5e9a70:	74 64                                           	je     0x5e9ad6
  5e9a72:	81 ff 3f 07 00 00                               	cmp    edi,0x73f
  5e9a78:	74 5c                                           	je     0x5e9ad6
  5e9a7a:	81 ff a5 06 00 00                               	cmp    edi,0x6a5
  5e9a80:	74 54                                           	je     0x5e9ad6
  5e9a82:	81 ff a7 06 00 00                               	cmp    edi,0x6a7
  5e9a88:	74 4c                                           	je     0x5e9ad6
  5e9a8a:	81 ff 40 07 00 00                               	cmp    edi,0x740
  5e9a90:	74 44                                           	je     0x5e9ad6
  5e9a92:	81 ff a6 06 00 00                               	cmp    edi,0x6a6
  5e9a98:	74 3c                                           	je     0x5e9ad6
  5e9a9a:	81 ff a8 06 00 00                               	cmp    edi,0x6a8
  5e9aa0:	74 34                                           	je     0x5e9ad6
  5e9aa2:	81 ff 36 07 00 00                               	cmp    edi,0x736
  5e9aa8:	74 2c                                           	je     0x5e9ad6
  5e9aaa:	81 ff 3a 07 00 00                               	cmp    edi,0x73a
  5e9ab0:	74 24                                           	je     0x5e9ad6
  5e9ab2:	81 ff 3b 07 00 00                               	cmp    edi,0x73b
  5e9ab8:	74 1c                                           	je     0x5e9ad6
  5e9aba:	81 ff 37 07 00 00                               	cmp    edi,0x737
  5e9ac0:	74 14                                           	je     0x5e9ad6
  5e9ac2:	81 ff 39 07 00 00                               	cmp    edi,0x739
  5e9ac8:	74 0c                                           	je     0x5e9ad6
  5e9aca:	81 ff 38 07 00 00                               	cmp    edi,0x738
  5e9ad0:	0f 85 c4 00 00 00                               	jne    0x5e9b9a
  5e9ad6:	8b 15 e0 23 85 00                               	mov    edx,DWORD PTR ds:0x8523e0
  5e9adc:	a1 6c dd 7a 00                                  	mov    eax,ds:0x7add6c
  5e9ae1:	3b d0                                           	cmp    edx,eax
  5e9ae3:	0f 8c b1 00 00 00                               	jl     0x5e9b9a
  5e9ae9:	a1 78 dd 7a 00                                  	mov    eax,ds:0x7add78
  5e9aee:	8b 1d 74 dd 7a 00                               	mov    ebx,DWORD PTR ds:0x7add74
  5e9af4:	2b c3                                           	sub    eax,ebx
  5e9af6:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e9afa:	99                                              	cdq
  5e9afb:	2b c2                                           	sub    eax,edx
  5e9afd:	d1 f8                                           	sar    eax,1
  5e9aff:	f7 d8                                           	neg    eax
  5e9b01:	03 c8                                           	add    ecx,eax
  5e9b03:	89 4c 24 10                                     	mov    DWORD PTR [esp+0x10],ecx
  5e9b07:	eb 58                                           	jmp    0x5e9b61
  5e9b09:	81 ff 3f 05 00 00                               	cmp    edi,0x53f
  5e9b0f:	75 0a                                           	jne    0x5e9b1b
  5e9b11:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e9b15:	40                                              	inc    eax
  5e9b16:	e9 11 fe ff ff                                  	jmp    0x5e992c
  5e9b1b:	81 ff 4f 05 00 00                               	cmp    edi,0x54f
  5e9b21:	74 35                                           	je     0x5e9b58
  5e9b23:	81 ff 4e 05 00 00                               	cmp    edi,0x54e
  5e9b29:	74 18                                           	je     0x5e9b43
  5e9b2b:	81 ff e8 03 00 00                               	cmp    edi,0x3e8
  5e9b31:	74 10                                           	je     0x5e9b43
  5e9b33:	81 ff 4d 05 00 00                               	cmp    edi,0x54d
  5e9b39:	74 08                                           	je     0x5e9b43
  5e9b3b:	81 ff 9a 06 00 00                               	cmp    edi,0x69a
  5e9b41:	75 57                                           	jne    0x5e9b9a
  5e9b43:	8b 44 24 18                                     	mov    eax,DWORD PTR [esp+0x18]
  5e9b47:	48                                              	dec    eax
  5e9b48:	3b c5                                           	cmp    eax,ebp
  5e9b4a:	89 44 24 18                                     	mov    DWORD PTR [esp+0x18],eax
  5e9b4e:	75 29                                           	jne    0x5e9b79
  5e9b50:	5f                                              	pop    edi
  5e9b51:	5e                                              	pop    esi
  5e9b52:	5d                                              	pop    ebp
  5e9b53:	5b                                              	pop    ebx
  5e9b54:	83 c4 3c                                        	add    esp,0x3c
  5e9b57:	c3                                              	ret
  5e9b58:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e9b5c:	48                                              	dec    eax
  5e9b5d:	89 44 24 10                                     	mov    DWORD PTR [esp+0x10],eax
  5e9b61:	8b 44 24 10                                     	mov    eax,DWORD PTR [esp+0x10]
  5e9b65:	8b 4c 24 20                                     	mov    ecx,DWORD PTR [esp+0x20]
  5e9b69:	3b c1                                           	cmp    eax,ecx
  5e9b6b:	75 0c                                           	jne    0x5e9b79
  5e9b6d:	8b 4c 24 28                                     	mov    ecx,DWORD PTR [esp+0x28]
  5e9b71:	8b 44 24 1c                                     	mov    eax,DWORD PTR [esp+0x1c]
  5e9b75:	3b c1                                           	cmp    eax,ecx
  5e9b77:	74 21                                           	je     0x5e9b9a
  5e9b79:	8b 54 24 1c                                     	mov    edx,DWORD PTR [esp+0x1c]
  5e9b7d:	8b 44 24 14                                     	mov    eax,DWORD PTR [esp+0x14]
  5e9b81:	8b 4c 24 10                                     	mov    ecx,DWORD PTR [esp+0x10]
  5e9b85:	6a 00                                           	push   0x0
  5e9b87:	52                                              	push   edx
  5e9b88:	8b 54 24 20                                     	mov    edx,DWORD PTR [esp+0x20]
  5e9b8c:	50                                              	push   eax
  5e9b8d:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5e9b91:	51                                              	push   ecx
  5e9b92:	52                                              	push   edx
  5e9b93:	50                                              	push   eax
  5e9b94:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9b9a:	5f                                              	pop    edi
  5e9b9b:	5e                                              	pop    esi
  5e9b9c:	5d                                              	pop    ebp
  5e9b9d:	5b                                              	pop    ebx
  5e9b9e:	83 c4 3c                                        	add    esp,0x3c
  5e9ba1:	c3                                              	ret

; 0x5e9bb0 <= VA < 0x5e9f00: Child routing and centered design640x480 content fallback.
  5e9bb0:	83 ec 34                                        	sub    esp,0x34
  5e9bb3:	55                                              	push   ebp
  5e9bb4:	56                                              	push   esi
  5e9bb5:	8b 74 24 40                                     	mov    esi,DWORD PTR [esp+0x40]
  5e9bb9:	56                                              	push   esi
  5e9bba:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9bc0:	8b e8                                           	mov    ebp,eax
  5e9bc2:	a1 cc 63 a7 00                                  	mov    eax,ds:0xa763cc
  5e9bc7:	3b c5                                           	cmp    eax,ebp
  5e9bc9:	89 6c 24 08                                     	mov    DWORD PTR [esp+0x8],ebp
  5e9bcd:	0f 85 1d 03 00 00                               	jne    0x5e9ef0
  5e9bd3:	53                                              	push   ebx
  5e9bd4:	57                                              	push   edi
  5e9bd5:	8d 44 24 14                                     	lea    eax,[esp+0x14]
  5e9bd9:	33 ff                                           	xor    edi,edi
  5e9bdb:	50                                              	push   eax
  5e9bdc:	8b d6                                           	mov    edx,esi
  5e9bde:	8b cd                                           	mov    ecx,ebp
  5e9be0:	89 7c 24 18                                     	mov    DWORD PTR [esp+0x18],edi
  5e9be4:	89 7c 24 1c                                     	mov    DWORD PTR [esp+0x1c],edi
  5e9be8:	89 7c 24 20                                     	mov    DWORD PTR [esp+0x20],edi
  5e9bec:	89 7c 24 24                                     	mov    DWORD PTR [esp+0x24],edi
  5e9bf0:	e8 5b c8 ff ff                                  	call   0x5e6450
  5e9bf5:	84 c0                                           	test   al,al
  5e9bf7:	74 21                                           	je     0x5e9c1a
  5e9bf9:	8d 54 24 14                                     	lea    edx,[esp+0x14]
  5e9bfd:	8b ce                                           	mov    ecx,esi
  5e9bff:	e8 9c ef ff ff                                  	call   0x5e8ba0
  5e9c04:	8b ce                                           	mov    ecx,esi
  5e9c06:	e8 05 f8 ff ff                                  	call   0x5e9410
  5e9c0b:	5f                                              	pop    edi
  5e9c0c:	5b                                              	pop    ebx
  5e9c0d:	5e                                              	pop    esi
  5e9c0e:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9c13:	5d                                              	pop    ebp
  5e9c14:	83 c4 34                                        	add    esp,0x34
  5e9c17:	c2 08 00                                        	ret    0x8
  5e9c1a:	8b 1d 8c a4 79 00                               	mov    ebx,DWORD PTR ds:0x79a48c ; USER32.dll!GetWindowLongA
  5e9c20:	6a f0                                           	push   0xfffffff0
  5e9c22:	56                                              	push   esi
  5e9c23:	ff d3                                           	call   ebx
  5e9c25:	83 e0 0b                                        	and    eax,0xb
  5e9c28:	3c 0b                                           	cmp    al,0xb
  5e9c2a:	75 3b                                           	jne    0x5e9c67
  5e9c2c:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e9c31:	89 74 24 48                                     	mov    DWORD PTR [esp+0x48],esi
  5e9c35:	3b c7                                           	cmp    eax,edi
  5e9c37:	74 2e                                           	je     0x5e9c67
  5e9c39:	8d 4c 24 48                                     	lea    ecx,[esp+0x48]
  5e9c3d:	51                                              	push   ecx
  5e9c3e:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e9c43:	e8 d8 83 01 00                                  	call   0x602020
  5e9c48:	8b 15 40 36 a7 00                               	mov    edx,DWORD PTR ds:0xa73640
  5e9c4e:	8b 04 82                                        	mov    eax,DWORD PTR [edx+eax*4]
  5e9c51:	3b c7                                           	cmp    eax,edi
  5e9c53:	74 12                                           	je     0x5e9c67
  5e9c55:	8b 4c 24 48                                     	mov    ecx,DWORD PTR [esp+0x48]
  5e9c59:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e9c5b:	74 38                                           	je     0x5e9c95
  5e9c5d:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e9c63:	3b c7                                           	cmp    eax,edi
  5e9c65:	75 f2                                           	jne    0x5e9c59
  5e9c67:	8b d6                                           	mov    edx,esi
  5e9c69:	8b cd                                           	mov    ecx,ebp
  5e9c6b:	e8 f0 cb ff ff                                  	call   0x5e6860
  5e9c70:	84 c0                                           	test   al,al
  5e9c72:	74 5f                                           	je     0x5e9cd3
  5e9c74:	8b 54 24 4c                                     	mov    edx,DWORD PTR [esp+0x4c]
  5e9c78:	8b ce                                           	mov    ecx,esi
  5e9c7a:	e8 a1 f1 ff ff                                  	call   0x5e8e20
  5e9c7f:	8b ce                                           	mov    ecx,esi
  5e9c81:	e8 8a f7 ff ff                                  	call   0x5e9410
  5e9c86:	5f                                              	pop    edi
  5e9c87:	5b                                              	pop    ebx
  5e9c88:	5e                                              	pop    esi
  5e9c89:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9c8e:	5d                                              	pop    ebp
  5e9c8f:	83 c4 34                                        	add    esp,0x34
  5e9c92:	c2 08 00                                        	ret    0x8
  5e9c95:	3b c7                                           	cmp    eax,edi
  5e9c97:	74 ce                                           	je     0x5e9c67
  5e9c99:	83 c0 04                                        	add    eax,0x4
  5e9c9c:	3b c7                                           	cmp    eax,edi
  5e9c9e:	74 c7                                           	je     0x5e9c67
  5e9ca0:	39 78 68                                        	cmp    DWORD PTR [eax+0x68],edi
  5e9ca3:	75 c2                                           	jne    0x5e9c67
  5e9ca5:	8b d6                                           	mov    edx,esi
  5e9ca7:	8b cd                                           	mov    ecx,ebp
  5e9ca9:	e8 b2 cb ff ff                                  	call   0x5e6860
  5e9cae:	84 c0                                           	test   al,al
  5e9cb0:	74 b5                                           	je     0x5e9c67
  5e9cb2:	8b 54 24 4c                                     	mov    edx,DWORD PTR [esp+0x4c]
  5e9cb6:	8b ce                                           	mov    ecx,esi
  5e9cb8:	e8 93 ef ff ff                                  	call   0x5e8c50
  5e9cbd:	8b ce                                           	mov    ecx,esi
  5e9cbf:	e8 4c f7 ff ff                                  	call   0x5e9410
  5e9cc4:	5f                                              	pop    edi
  5e9cc5:	5b                                              	pop    ebx
  5e9cc6:	5e                                              	pop    esi
  5e9cc7:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9ccc:	5d                                              	pop    ebp
  5e9ccd:	83 c4 34                                        	add    esp,0x34
  5e9cd0:	c2 08 00                                        	ret    0x8
  5e9cd3:	6a f0                                           	push   0xfffffff0
  5e9cd5:	56                                              	push   esi
  5e9cd6:	ff d3                                           	call   ebx
  5e9cd8:	83 e0 0b                                        	and    eax,0xb
  5e9cdb:	3c 0b                                           	cmp    al,0xb
  5e9cdd:	75 3b                                           	jne    0x5e9d1a
  5e9cdf:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e9ce4:	89 74 24 48                                     	mov    DWORD PTR [esp+0x48],esi
  5e9ce8:	3b c7                                           	cmp    eax,edi
  5e9cea:	74 2e                                           	je     0x5e9d1a
  5e9cec:	8d 44 24 48                                     	lea    eax,[esp+0x48]
  5e9cf0:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e9cf5:	50                                              	push   eax
  5e9cf6:	e8 25 83 01 00                                  	call   0x602020
  5e9cfb:	8b 0d 40 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa73640
  5e9d01:	8b 04 81                                        	mov    eax,DWORD PTR [ecx+eax*4]
  5e9d04:	3b c7                                           	cmp    eax,edi
  5e9d06:	74 12                                           	je     0x5e9d1a
  5e9d08:	8b 4c 24 48                                     	mov    ecx,DWORD PTR [esp+0x48]
  5e9d0c:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e9d0e:	74 34                                           	je     0x5e9d44
  5e9d10:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e9d16:	3b c7                                           	cmp    eax,edi
  5e9d18:	75 f2                                           	jne    0x5e9d0c
  5e9d1a:	8b d6                                           	mov    edx,esi
  5e9d1c:	8b cd                                           	mov    ecx,ebp
  5e9d1e:	e8 9d d5 ff ff                                  	call   0x5e72c0
  5e9d23:	84 c0                                           	test   al,al
  5e9d25:	74 57                                           	je     0x5e9d7e
  5e9d27:	8b ce                                           	mov    ecx,esi
  5e9d29:	e8 42 f3 ff ff                                  	call   0x5e9070
  5e9d2e:	8b ce                                           	mov    ecx,esi
  5e9d30:	e8 db f6 ff ff                                  	call   0x5e9410
  5e9d35:	5f                                              	pop    edi
  5e9d36:	5b                                              	pop    ebx
  5e9d37:	5e                                              	pop    esi
  5e9d38:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9d3d:	5d                                              	pop    ebp
  5e9d3e:	83 c4 34                                        	add    esp,0x34
  5e9d41:	c2 08 00                                        	ret    0x8
  5e9d44:	3b c7                                           	cmp    eax,edi
  5e9d46:	74 d2                                           	je     0x5e9d1a
  5e9d48:	83 c0 04                                        	add    eax,0x4
  5e9d4b:	3b c7                                           	cmp    eax,edi
  5e9d4d:	74 cb                                           	je     0x5e9d1a
  5e9d4f:	39 78 68                                        	cmp    DWORD PTR [eax+0x68],edi
  5e9d52:	75 c6                                           	jne    0x5e9d1a
  5e9d54:	8b d6                                           	mov    edx,esi
  5e9d56:	8b cd                                           	mov    ecx,ebp
  5e9d58:	e8 63 d5 ff ff                                  	call   0x5e72c0
  5e9d5d:	84 c0                                           	test   al,al
  5e9d5f:	74 b9                                           	je     0x5e9d1a
  5e9d61:	8b ce                                           	mov    ecx,esi
  5e9d63:	e8 38 f2 ff ff                                  	call   0x5e8fa0
  5e9d68:	8b ce                                           	mov    ecx,esi
  5e9d6a:	e8 a1 f6 ff ff                                  	call   0x5e9410
  5e9d6f:	5f                                              	pop    edi
  5e9d70:	5b                                              	pop    ebx
  5e9d71:	5e                                              	pop    esi
  5e9d72:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9d77:	5d                                              	pop    ebp
  5e9d78:	83 c4 34                                        	add    esp,0x34
  5e9d7b:	c2 08 00                                        	ret    0x8
  5e9d7e:	a1 44 36 a7 00                                  	mov    eax,ds:0xa73644
  5e9d83:	89 6c 24 48                                     	mov    DWORD PTR [esp+0x48],ebp
  5e9d87:	3b c7                                           	cmp    eax,edi
  5e9d89:	74 3e                                           	je     0x5e9dc9
  5e9d8b:	8d 54 24 48                                     	lea    edx,[esp+0x48]
  5e9d8f:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e9d94:	52                                              	push   edx
  5e9d95:	e8 86 82 01 00                                  	call   0x602020
  5e9d9a:	8b 0d 40 36 a7 00                               	mov    ecx,DWORD PTR ds:0xa73640
  5e9da0:	8b 04 81                                        	mov    eax,DWORD PTR [ecx+eax*4]
  5e9da3:	3b c7                                           	cmp    eax,edi
  5e9da5:	74 22                                           	je     0x5e9dc9
  5e9da7:	8b 4c 24 48                                     	mov    ecx,DWORD PTR [esp+0x48]
  5e9dab:	39 08                                           	cmp    DWORD PTR [eax],ecx
  5e9dad:	74 0c                                           	je     0x5e9dbb
  5e9daf:	8b 80 04 02 00 00                               	mov    eax,DWORD PTR [eax+0x204]
  5e9db5:	3b c7                                           	cmp    eax,edi
  5e9db7:	75 f2                                           	jne    0x5e9dab
  5e9db9:	eb 0e                                           	jmp    0x5e9dc9
  5e9dbb:	3b c7                                           	cmp    eax,edi
  5e9dbd:	74 0a                                           	je     0x5e9dc9
  5e9dbf:	83 c0 04                                        	add    eax,0x4
  5e9dc2:	3b c7                                           	cmp    eax,edi
  5e9dc4:	74 03                                           	je     0x5e9dc9
  5e9dc6:	8b 78 6c                                        	mov    edi,DWORD PTR [eax+0x6c]
  5e9dc9:	8b 1d f4 a3 79 00                               	mov    ebx,DWORD PTR ds:0x79a3f4 ; USER32.dll!GetDlgCtrlID
  5e9dcf:	56                                              	push   esi
  5e9dd0:	ff d3                                           	call   ebx
  5e9dd2:	8b cf                                           	mov    ecx,edi
  5e9dd4:	8b e8                                           	mov    ebp,eax
  5e9dd6:	e8 85 58 ff ff                                  	call   0x5df660
  5e9ddb:	84 c0                                           	test   al,al
  5e9ddd:	74 25                                           	je     0x5e9e04
  5e9ddf:	81 fd 95 06 00 00                               	cmp    ebp,0x695
  5e9de5:	75 1d                                           	jne    0x5e9e04
  5e9de7:	8b ce                                           	mov    ecx,esi
  5e9de9:	e8 b2 f3 ff ff                                  	call   0x5e91a0
  5e9dee:	8b ce                                           	mov    ecx,esi
  5e9df0:	e8 1b f6 ff ff                                  	call   0x5e9410
  5e9df5:	5f                                              	pop    edi
  5e9df6:	5b                                              	pop    ebx
  5e9df7:	5e                                              	pop    esi
  5e9df8:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9dfd:	5d                                              	pop    ebp
  5e9dfe:	83 c4 34                                        	add    esp,0x34
  5e9e01:	c2 08 00                                        	ret    0x8
  5e9e04:	8b 54 24 10                                     	mov    edx,DWORD PTR [esp+0x10]
  5e9e08:	8d 44 24 48                                     	lea    eax,[esp+0x48]
  5e9e0c:	8d 4c 24 10                                     	lea    ecx,[esp+0x10]
  5e9e10:	50                                              	push   eax
  5e9e11:	51                                              	push   ecx
  5e9e12:	b9 40 36 a7 00                                  	mov    ecx,0xa73640
  5e9e17:	89 54 24 18                                     	mov    DWORD PTR [esp+0x18],edx
  5e9e1b:	c7 44 24 50 00 00 00 00                         	mov    DWORD PTR [esp+0x50],0x0
  5e9e23:	e8 e8 78 01 00                                  	call   0x601710
  5e9e28:	8b 44 24 48                                     	mov    eax,DWORD PTR [esp+0x48]
  5e9e2c:	85 c0                                           	test   eax,eax
  5e9e2e:	74 05                                           	je     0x5e9e35
  5e9e30:	8b 78 6c                                        	mov    edi,DWORD PTR [eax+0x6c]
  5e9e33:	eb 02                                           	jmp    0x5e9e37
  5e9e35:	33 ff                                           	xor    edi,edi
  5e9e37:	56                                              	push   esi
  5e9e38:	ff d3                                           	call   ebx
  5e9e3a:	81 ff e2 00 00 00                               	cmp    edi,0xe2
  5e9e40:	75 29                                           	jne    0x5e9e6b
  5e9e42:	3d 1d 07 00 00                                  	cmp    eax,0x71d
  5e9e47:	0f 94 c0                                        	sete   al
  5e9e4a:	84 c0                                           	test   al,al
  5e9e4c:	74 1d                                           	je     0x5e9e6b
  5e9e4e:	8b ce                                           	mov    ecx,esi
  5e9e50:	e8 0b f4 ff ff                                  	call   0x5e9260
  5e9e55:	8b ce                                           	mov    ecx,esi
  5e9e57:	e8 b4 f5 ff ff                                  	call   0x5e9410
  5e9e5c:	5f                                              	pop    edi
  5e9e5d:	5b                                              	pop    ebx
  5e9e5e:	5e                                              	pop    esi
  5e9e5f:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9e64:	5d                                              	pop    ebp
  5e9e65:	83 c4 34                                        	add    esp,0x34
  5e9e68:	c2 08 00                                        	ret    0x8
  5e9e6b:	56                                              	push   esi
  5e9e6c:	ff 15 00 a5 79 00                               	call   DWORD PTR ds:0x79a500 ; USER32.dll!GetParent
  5e9e72:	8b 3d 98 a3 79 00                               	mov    edi,DWORD PTR ds:0x79a398 ; USER32.dll!GetWindowRect
  5e9e78:	8d 54 24 34                                     	lea    edx,[esp+0x34]
  5e9e7c:	52                                              	push   edx
  5e9e7d:	50                                              	push   eax
  5e9e7e:	ff d7                                           	call   edi
  5e9e80:	8d 44 24 24                                     	lea    eax,[esp+0x24]
  5e9e84:	50                                              	push   eax
  5e9e85:	56                                              	push   esi
  5e9e86:	ff d7                                           	call   edi
  5e9e88:	6a 00                                           	push   0x0
  5e9e8a:	8b 6c 24 3c                                     	mov    ebp,DWORD PTR [esp+0x3c]
  5e9e8e:	8b 54 24 34                                     	mov    edx,DWORD PTR [esp+0x34]
  5e9e92:	8b 4c 24 2c                                     	mov    ecx,DWORD PTR [esp+0x2c]
  5e9e96:	8b 44 24 30                                     	mov    eax,DWORD PTR [esp+0x30]
  5e9e9a:	8b 7c 24 28                                     	mov    edi,DWORD PTR [esp+0x28]
  5e9e9e:	8b 5c 24 50                                     	mov    ebx,DWORD PTR [esp+0x50]
  5e9ea2:	2b d1                                           	sub    edx,ecx
  5e9ea4:	2b c7                                           	sub    eax,edi
  5e9ea6:	52                                              	push   edx
  5e9ea7:	8b 53 04                                        	mov    edx,DWORD PTR [ebx+0x4]
  5e9eaa:	50                                              	push   eax
  5e9eab:	a1 e4 23 85 00                                  	mov    eax,ds:0x8523e4
  5e9eb0:	2b c2                                           	sub    eax,edx
  5e9eb2:	99                                              	cdq
  5e9eb3:	2b c2                                           	sub    eax,edx
  5e9eb5:	8b 13                                           	mov    edx,DWORD PTR [ebx]
  5e9eb7:	d1 f8                                           	sar    eax,1
  5e9eb9:	2b c5                                           	sub    eax,ebp
  5e9ebb:	8b 5c 24 40                                     	mov    ebx,DWORD PTR [esp+0x40]
  5e9ebf:	03 c1                                           	add    eax,ecx
  5e9ec1:	50                                              	push   eax
  5e9ec2:	a1 e0 23 85 00                                  	mov    eax,ds:0x8523e0
  5e9ec7:	2b c2                                           	sub    eax,edx
  5e9ec9:	99                                              	cdq
  5e9eca:	2b c2                                           	sub    eax,edx
  5e9ecc:	d1 f8                                           	sar    eax,1
  5e9ece:	2b c3                                           	sub    eax,ebx
  5e9ed0:	03 c7                                           	add    eax,edi
  5e9ed2:	50                                              	push   eax
  5e9ed3:	56                                              	push   esi
  5e9ed4:	ff 15 e0 a3 79 00                               	call   DWORD PTR ds:0x79a3e0 ; USER32.dll!MoveWindow
  5e9eda:	8b ce                                           	mov    ecx,esi
  5e9edc:	e8 2f f5 ff ff                                  	call   0x5e9410
  5e9ee1:	5f                                              	pop    edi
  5e9ee2:	5b                                              	pop    ebx
  5e9ee3:	5e                                              	pop    esi
  5e9ee4:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9ee9:	5d                                              	pop    ebp
  5e9eea:	83 c4 34                                        	add    esp,0x34
  5e9eed:	c2 08 00                                        	ret    0x8
  5e9ef0:	5e                                              	pop    esi
  5e9ef1:	b8 01 00 00 00                                  	mov    eax,0x1
  5e9ef6:	5d                                              	pop    ebp
  5e9ef7:	83 c4 34                                        	add    esp,0x34
  5e9efa:	c2 08 00                                        	ret    0x8
  5e9efd:	90                                              	nop
  5e9efe:	90                                              	nop
  5e9eff:	90                                              	nop
