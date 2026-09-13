; READ-ONLY STATIC EVIDENCE. Never executed.
; Input SHA256 06f994965ebde56116d5d53b2e8ffb0c999124166ad99032566cc33d7f83ccdb
; VA addresses, image base 0x400000. Gaps between spans are omitted.
; Disassembly is evidence for branches, not observed screen pixels.

; Span 0x4cfc48 <= VA < 0x4cfe18

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004cfc48 <.text+0xcec48>:
  4cfc48:	8b 1d 9c a4 79 00    	mov    ebx,DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  4cfc4e:	68 29 05 00 00       	push   0x529
  4cfc53:	56                   	push   esi
  4cfc54:	ff d3                	call   ebx
  4cfc56:	8b 3d a0 a4 79 00    	mov    edi,DWORD PTR ds:0x79a4a0 ; USER32.dll!SendMessageA
  4cfc5c:	8b e8                	mov    ebp,eax
  4cfc5e:	a1 98 d2 a3 00       	mov    eax,ds:0xa3d298
  4cfc63:	85 c0                	test   eax,eax
  4cfc65:	75 30                	jne    0x4cfc97
  4cfc67:	a0 84 0d a4 00       	mov    al,ds:0xa40d84
  4cfc6c:	84 c0                	test   al,al
  4cfc6e:	75 27                	jne    0x4cfc97
  4cfc70:	6a 00                	push   0x0
  4cfc72:	55                   	push   ebp
  4cfc73:	8b 2d 98 a4 79 00    	mov    ebp,DWORD PTR ds:0x79a498 ; USER32.dll!ShowWindow
  4cfc79:	ff d5                	call   ebp
  4cfc7b:	68 14 07 00 00       	push   0x714
  4cfc80:	56                   	push   esi
  4cfc81:	ff d3                	call   ebx
  4cfc83:	6a 00                	push   0x0
  4cfc85:	50                   	push   eax
  4cfc86:	ff d5                	call   ebp
  4cfc88:	68 71 06 00 00       	push   0x671
  4cfc8d:	56                   	push   esi
  4cfc8e:	ff d3                	call   ebx
  4cfc90:	6a 00                	push   0x0
  4cfc92:	50                   	push   eax
  4cfc93:	ff d5                	call   ebp
  4cfc95:	eb 3d                	jmp    0x4cfcd4
  4cfc97:	85 ed                	test   ebp,ebp
  4cfc99:	74 33                	je     0x4cfcce
  4cfc9b:	6a 00                	push   0x0
  4cfc9d:	6a 00                	push   0x0
  4cfc9f:	68 ac 04 00 00       	push   0x4ac
  4cfca4:	55                   	push   ebp
  4cfca5:	ff d7                	call   edi
  4cfca7:	68 00 00 06 00       	push   0x60000
  4cfcac:	6a 01                	push   0x1
  4cfcae:	68 06 04 00 00       	push   0x406
  4cfcb3:	55                   	push   ebp
  4cfcb4:	ff d7                	call   edi
  4cfcb6:	8b 15 18 0b a4 00    	mov    edx,DWORD PTR ds:0xa40b18
  4cfcbc:	b8 06 00 00 00       	mov    eax,0x6
  4cfcc1:	2b c2                	sub    eax,edx
  4cfcc3:	50                   	push   eax
  4cfcc4:	6a 01                	push   0x1
  4cfcc6:	68 05 04 00 00       	push   0x405
  4cfccb:	55                   	push   ebp
  4cfccc:	ff d7                	call   edi
  4cfcce:	8b 2d 98 a4 79 00    	mov    ebp,DWORD PTR ds:0x79a498 ; USER32.dll!ShowWindow
  4cfcd4:	a1 48 d5 a3 00       	mov    eax,ds:0xa3d548
  4cfcd9:	85 c0                	test   eax,eax
  4cfcdb:	74 27                	je     0x4cfd04
  4cfcdd:	68 29 05 00 00       	push   0x529
  4cfce2:	56                   	push   esi
  4cfce3:	ff d3                	call   ebx
  4cfce5:	6a 00                	push   0x0
  4cfce7:	50                   	push   eax
  4cfce8:	ff d5                	call   ebp
  4cfcea:	68 14 07 00 00       	push   0x714
  4cfcef:	56                   	push   esi
  4cfcf0:	ff d3                	call   ebx
  4cfcf2:	6a 00                	push   0x0
  4cfcf4:	50                   	push   eax
  4cfcf5:	ff d5                	call   ebp
  4cfcf7:	68 71 06 00 00       	push   0x671
  4cfcfc:	56                   	push   esi
  4cfcfd:	ff d3                	call   ebx
  4cfcff:	6a 00                	push   0x0
  4cfd01:	50                   	push   eax
  4cfd02:	ff d5                	call   ebp
  4cfd04:	68 2a 05 00 00       	push   0x52a
  4cfd09:	56                   	push   esi
  4cfd0a:	ff d3                	call   ebx
  4cfd0c:	8b e8                	mov    ebp,eax
  4cfd0e:	85 ed                	test   ebp,ebp
  4cfd10:	74 33                	je     0x4cfd45
  4cfd12:	6a 00                	push   0x0
  4cfd14:	6a 00                	push   0x0
  4cfd16:	68 ac 04 00 00       	push   0x4ac
  4cfd1b:	55                   	push   ebp
  4cfd1c:	ff d7                	call   edi
  4cfd1e:	68 00 00 06 00       	push   0x60000
  4cfd23:	6a 01                	push   0x1
  4cfd25:	68 06 04 00 00       	push   0x406
  4cfd2a:	55                   	push   ebp
  4cfd2b:	ff d7                	call   edi
  4cfd2d:	8b 15 24 0b a4 00    	mov    edx,DWORD PTR ds:0xa40b24
  4cfd33:	b9 06 00 00 00       	mov    ecx,0x6
  4cfd38:	2b ca                	sub    ecx,edx
  4cfd3a:	51                   	push   ecx
  4cfd3b:	6a 01                	push   0x1
  4cfd3d:	68 05 04 00 00       	push   0x405
  4cfd42:	55                   	push   ebp
  4cfd43:	ff d7                	call   edi
  4cfd45:	68 2b 05 00 00       	push   0x52b
  4cfd4a:	56                   	push   esi
  4cfd4b:	ff d3                	call   ebx
  4cfd4d:	8b e8                	mov    ebp,eax
  4cfd4f:	85 ed                	test   ebp,ebp
  4cfd51:	74 2c                	je     0x4cfd7f
  4cfd53:	6a 00                	push   0x0
  4cfd55:	6a 00                	push   0x0
  4cfd57:	68 ac 04 00 00       	push   0x4ac
  4cfd5c:	55                   	push   ebp
  4cfd5d:	ff d7                	call   edi
  4cfd5f:	68 00 00 02 00       	push   0x20000
  4cfd64:	6a 01                	push   0x1
  4cfd66:	68 06 04 00 00       	push   0x406
  4cfd6b:	55                   	push   ebp
  4cfd6c:	ff d7                	call   edi
  4cfd6e:	8b 15 2c 0b a4 00    	mov    edx,DWORD PTR ds:0xa40b2c
  4cfd74:	52                   	push   edx
  4cfd75:	6a 01                	push   0x1
  4cfd77:	68 05 04 00 00       	push   0x405
  4cfd7c:	55                   	push   ebp
  4cfd7d:	ff d7                	call   edi
  4cfd7f:	68 01 06 00 00       	push   0x601
  4cfd84:	56                   	push   esi
  4cfd85:	ff d3                	call   ebx
  4cfd87:	85 c0                	test   eax,eax
  4cfd89:	74 18                	je     0x4cfda3
  4cfd8b:	8a 15 32 0b a4 00    	mov    dl,BYTE PTR ds:0xa40b32
  4cfd91:	33 c9                	xor    ecx,ecx
  4cfd93:	84 d2                	test   dl,dl
  4cfd95:	0f 95 c1             	setne  cl
  4cfd98:	6a 00                	push   0x0
  4cfd9a:	51                   	push   ecx
  4cfd9b:	68 f1 00 00 00       	push   0xf1
  4cfda0:	50                   	push   eax
  4cfda1:	ff d7                	call   edi
  4cfda3:	68 04 06 00 00       	push   0x604
  4cfda8:	56                   	push   esi
  4cfda9:	ff d3                	call   ebx
  4cfdab:	85 c0                	test   eax,eax
  4cfdad:	74 18                	je     0x4cfdc7
  4cfdaf:	8a 0d 33 0b a4 00    	mov    cl,BYTE PTR ds:0xa40b33
  4cfdb5:	33 d2                	xor    edx,edx
  4cfdb7:	84 c9                	test   cl,cl
  4cfdb9:	0f 95 c2             	setne  dl
  4cfdbc:	6a 00                	push   0x0
  4cfdbe:	52                   	push   edx
  4cfdbf:	68 f1 00 00 00       	push   0xf1
  4cfdc4:	50                   	push   eax
  4cfdc5:	ff d7                	call   edi
  4cfdc7:	68 02 06 00 00       	push   0x602
  4cfdcc:	56                   	push   esi
  4cfdcd:	ff d3                	call   ebx
  4cfdcf:	85 c0                	test   eax,eax
  4cfdd1:	74 18                	je     0x4cfdeb
  4cfdd3:	8a 15 34 0b a4 00    	mov    dl,BYTE PTR ds:0xa40b34
  4cfdd9:	33 c9                	xor    ecx,ecx
  4cfddb:	84 d2                	test   dl,dl
  4cfddd:	0f 95 c1             	setne  cl
  4cfde0:	6a 00                	push   0x0
  4cfde2:	51                   	push   ecx
  4cfde3:	68 f1 00 00 00       	push   0xf1
  4cfde8:	50                   	push   eax
  4cfde9:	ff d7                	call   edi
  4cfdeb:	80 3d 58 09 a4 00 01 	cmp    BYTE PTR ds:0xa40958,0x1
  4cfdf2:	75 28                	jne    0x4cfe1c
  4cfdf4:	68 2d 05 00 00       	push   0x52d
  4cfdf9:	56                   	push   esi
  4cfdfa:	ff d3                	call   ebx
  4cfdfc:	8b f0                	mov    esi,eax
  4cfdfe:	85 f6                	test   esi,esi
  4cfe00:	0f 84 98 01 00 00    	je     0x4cff9e
  4cfe06:	e8 25 71 f3 ff       	call   0x406f30
  4cfe0b:	50                   	push   eax
  4cfe0c:	56                   	push   esi
  4cfe0d:	ff 15 90 a4 79 00    	call   DWORD PTR ds:0x79a490 ; USER32.dll!EnableWindow
  4cfe13:	5f                   	pop    edi
  4cfe14:	5e                   	pop    esi
  4cfe15:	5d                   	pop    ebp
  4cfe16:	33 c0                	xor    eax,eax

; Span 0x4cfa48 <= VA < 0x4cfbd3

/tmp/ra2-engine-reference/game.exe:     file format pei-i386


Disassembly of section .text:

004cfa48 <.text+0xcea48>:
  4cfa48:	80 3d 58 09 a4 00 01 	cmp    BYTE PTR ds:0xa40958,0x1
  4cfa4f:	0f 85 85 00 00 00    	jne    0x4cfada
  4cfa55:	a1 98 d2 a3 00       	mov    eax,ds:0xa3d298
  4cfa5a:	85 c0                	test   eax,eax
  4cfa5c:	74 7c                	je     0x4cfada
  4cfa5e:	83 f8 05             	cmp    eax,0x5
  4cfa61:	74 77                	je     0x4cfada
  4cfa63:	51                   	push   ecx
  4cfa64:	8b 0d b4 5d a3 00    	mov    ecx,DWORD PTR ds:0xa35db4
  4cfa6a:	6a 0d                	push   0xd
  4cfa6c:	8b 51 30             	mov    edx,DWORD PTR [ecx+0x30]
  4cfa6f:	8d 4c 24 18          	lea    ecx,[esp+0x18]
  4cfa73:	52                   	push   edx
  4cfa74:	e8 b7 65 fe ff       	call   0x4b6030
  4cfa79:	81 3d 38 23 a3 00 80 	cmp    DWORD PTR ds:0xa32338,0x80
  4cfa80:	00 00 00
  4cfa83:	7d 5b                	jge    0x4cfae0
  4cfa85:	8b 0d 40 23 a3 00    	mov    ecx,DWORD PTR ds:0xa32340
  4cfa8b:	8b f0                	mov    esi,eax
  4cfa8d:	8d 14 c9             	lea    edx,[ecx+ecx*8]
  4cfa90:	8d 0c 91             	lea    ecx,[ecx+edx*4]
  4cfa93:	8d bc 49 44 23 a3 00 	lea    edi,[ecx+ecx*2+0xa32344]
  4cfa9a:	b9 1b 00 00 00       	mov    ecx,0x1b
  4cfa9f:	f3 a5                	rep movs DWORD PTR es:[edi],DWORD PTR ds:[esi]
  4cfaa1:	66 a5                	movs   WORD PTR es:[edi],WORD PTR ds:[esi]
  4cfaa3:	a4                   	movs   BYTE PTR es:[edi],BYTE PTR ds:[esi]
  4cfaa4:	ff 15 24 a5 79 00    	call   DWORD PTR ds:0x79a524 ; WINMM.dll!timeGetTime
  4cfaaa:	8b 0d 40 23 a3 00    	mov    ecx,DWORD PTR ds:0xa32340
  4cfab0:	8b 3d 9c a4 79 00    	mov    edi,DWORD PTR ds:0x79a49c ; USER32.dll!GetDlgItem
  4cfab6:	89 04 8d c4 5a a3 00 	mov    DWORD PTR [ecx*4+0xa35ac4],eax
  4cfabd:	8b 15 40 23 a3 00    	mov    edx,DWORD PTR ds:0xa32340
  4cfac3:	a1 38 23 a3 00       	mov    eax,ds:0xa32338
  4cfac8:	42                   	inc    edx
  4cfac9:	83 e2 7f             	and    edx,0x7f
  4cfacc:	40                   	inc    eax
  4cfacd:	89 15 40 23 a3 00    	mov    DWORD PTR ds:0xa32340,edx
  4cfad3:	a3 38 23 a3 00       	mov    ds:0xa32338,eax
  4cfad8:	eb 06                	jmp    0x4cfae0
  4cfada:	89 0d 18 0b a4 00    	mov    DWORD PTR ds:0xa40b18,ecx
  4cfae0:	8b 45 00             	mov    eax,DWORD PTR [ebp+0x0]
  4cfae3:	68 2a 05 00 00       	push   0x52a
  4cfae8:	50                   	push   eax
  4cfae9:	ff d7                	call   edi
  4cfaeb:	85 c0                	test   eax,eax
  4cfaed:	74 19                	je     0x4cfb08
  4cfaef:	6a 00                	push   0x0
  4cfaf1:	6a 00                	push   0x0
  4cfaf3:	68 00 04 00 00       	push   0x400
  4cfaf8:	50                   	push   eax
  4cfaf9:	ff d3                	call   ebx
  4cfafb:	b9 06 00 00 00       	mov    ecx,0x6
  4cfb00:	2b c8                	sub    ecx,eax
  4cfb02:	89 0d 24 0b a4 00    	mov    DWORD PTR ds:0xa40b24,ecx
  4cfb08:	8b 55 00             	mov    edx,DWORD PTR [ebp+0x0]
  4cfb0b:	68 2b 05 00 00       	push   0x52b
  4cfb10:	52                   	push   edx
  4cfb11:	ff d7                	call   edi
  4cfb13:	85 c0                	test   eax,eax
  4cfb15:	74 23                	je     0x4cfb3a
  4cfb17:	6a 00                	push   0x0
  4cfb19:	6a 00                	push   0x0
  4cfb1b:	68 00 04 00 00       	push   0x400
  4cfb20:	50                   	push   eax
  4cfb21:	ff d3                	call   ebx
  4cfb23:	39 05 2c 0b a4 00    	cmp    DWORD PTR ds:0xa40b2c,eax
  4cfb29:	74 0f                	je     0x4cfb3a
  4cfb2b:	b9 e0 24 83 00       	mov    ecx,0x8324e0
  4cfb30:	a3 2c 0b a4 00       	mov    ds:0xa40b2c,eax
  4cfb35:	e8 36 ea fc ff       	call   0x49e570
  4cfb3a:	8b 45 00             	mov    eax,DWORD PTR [ebp+0x0]
  4cfb3d:	68 01 06 00 00       	push   0x601
  4cfb42:	50                   	push   eax
  4cfb43:	ff d7                	call   edi
  4cfb45:	85 c0                	test   eax,eax
  4cfb47:	74 1d                	je     0x4cfb66
  4cfb49:	6a 00                	push   0x0
  4cfb4b:	6a 00                	push   0x0
  4cfb4d:	68 f0 00 00 00       	push   0xf0
  4cfb52:	50                   	push   eax
  4cfb53:	ff d3                	call   ebx
  4cfb55:	83 f8 01             	cmp    eax,0x1
  4cfb58:	0f 94 c1             	sete   cl
  4cfb5b:	88 0d 32 0b a4 00    	mov    BYTE PTR ds:0xa40b32,cl
  4cfb61:	e8 5a 7e 20 00       	call   0x6d79c0
  4cfb66:	8b 4d 00             	mov    ecx,DWORD PTR [ebp+0x0]
  4cfb69:	68 04 06 00 00       	push   0x604
  4cfb6e:	51                   	push   ecx
  4cfb6f:	ff d7                	call   edi
  4cfb71:	85 c0                	test   eax,eax
  4cfb73:	74 18                	je     0x4cfb8d
  4cfb75:	6a 00                	push   0x0
  4cfb77:	6a 00                	push   0x0
  4cfb79:	68 f0 00 00 00       	push   0xf0
  4cfb7e:	50                   	push   eax
  4cfb7f:	ff d3                	call   ebx
  4cfb81:	83 f8 01             	cmp    eax,0x1
  4cfb84:	0f 94 c2             	sete   dl
  4cfb87:	88 15 33 0b a4 00    	mov    BYTE PTR ds:0xa40b33,dl
  4cfb8d:	8b 45 00             	mov    eax,DWORD PTR [ebp+0x0]
  4cfb90:	68 02 06 00 00       	push   0x602
  4cfb95:	50                   	push   eax
  4cfb96:	ff d7                	call   edi
  4cfb98:	85 c0                	test   eax,eax
  4cfb9a:	74 32                	je     0x4cfbce
  4cfb9c:	6a 00                	push   0x0
  4cfb9e:	6a 00                	push   0x0
  4cfba0:	68 f0 00 00 00       	push   0xf0
  4cfba5:	50                   	push   eax
  4cfba6:	ff d3                	call   ebx
  4cfba8:	8b 35 b0 99 83 00    	mov    esi,DWORD PTR ds:0x8399b0
  4cfbae:	83 f8 01             	cmp    eax,0x1
  4cfbb1:	0f 94 c0             	sete   al
  4cfbb4:	85 f6                	test   esi,esi
  4cfbb6:	a2 34 0b a4 00       	mov    ds:0xa40b34,al
  4cfbbb:	74 11                	je     0x4cfbce
  4cfbbd:	80 3d 58 09 a4 00 01 	cmp    BYTE PTR ds:0xa40958,0x1
  4cfbc4:	75 08                	jne    0x4cfbce
  4cfbc6:	50                   	push   eax
  4cfbc7:	8b ce                	mov    ecx,esi
  4cfbc9:	e8 b2 b8 21 00       	call   0x6eb480
  4cfbce:	a0 58 09 a4 00       	mov    al,ds:0xa40958
