// Copyright 2017-2018 DERO Project. All rights reserved.
// Use of this source code in any form is governed by GPL 3 license.
// license can be found in the LICENSE file.
// GPG: 0F39 E425 8C65 3947 702A  8234 08B2 0360 A03A 9DE8
//
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

package main

import "fmt"
//import "time"
import "runtime"
import "strings"
import "path/filepath"
import "encoding/hex"
import "encoding/json"
import "github.com/deroproject/derosuite/walletapi"
import "github.com/deroproject/derosuite/globals"
//import "github.com/deroproject/derosuite/crypto"
import "github.com/deroproject/derosuite/address"
import "github.com/deroproject/derosuite/transaction"

// this goroutine continuously updates  height/balances if a wallet is open
func update_heights_balances()(int64, int64, int64, string, string, string) {

	// counter := 0
	if global_object != nil && global_object.walletptr != nil {
		global_object.Lock()
		//counter++
		height := int64(global_object.walletptr.Get_Height())
		//global_object.SetHeight(int64(counter))
		topoHeight := int64(global_object.walletptr.Get_TopoHeight())

		Nweight := int64(global_object.walletptr.Get_Daemon_Height())

		u, l := global_object.walletptr.Get_Balance()
		totalBalance := globals.FormatMoney12(l + u)
		unlockedBalance := globals.FormatMoney12(u)
		lockedBalance := globals.FormatMoney12(l)

		global_object.Unlock()
		return height, topoHeight, Nweight, totalBalance, unlockedBalance, lockedBalance
	}

	return 0,0,0,"", "", ""
}
/*
func (t *CtxObject) addressVerify(addr string) {
	if global_object != nil && global_object.walletptr != nil {
		addr, err := globals.ParseValidateAddress(addr)
		if err == nil {
			global_object.SetAddressverified(true)
			if addr.IsIntegratedAddress() {
				global_object.SetAddressintegrated(true)
				global_object.SetAddressipaymentid(fmt.Sprintf("%x", addr.PaymentID))
			} else {
				global_object.SetAddressintegrated(false)
				global_object.SetAddressipaymentid("")
			}
			return
		} else {
			global_object.SetAddressverified(false)
			global_object.SetAddressintegrated(false)
			// fmt.Println("addressVerify: %s err %s", addr, err)
			return
		}
	}

	global_object.SetAddressverified(false)
	global_object.SetAddressintegrated(false)
	//global_object.SetAddressipaymentid("")

	// fmt.Println("addressVerify: %s err wallet not ready", addr)

}

func (t *CtxObject) paymentidVerify(payid string) {

	// paymentid is 16 or 64 hex chars
	lpayid := strings.TrimSpace(payid)

	lpayid_raw, err := hex.DecodeString(lpayid)

	if err != nil {
		global_object.SetPaymentidverified(false)
		return
	}

	switch len(lpayid_raw) {
	case 0, 8, 32:
		global_object.SetPaymentidverified(true)
		return
	default:
		global_object.SetPaymentidverified(false)
	}

	global_object.SetPaymentidverified(false)

}

func (t *CtxObject) amountVerify(amountstr string) {

	// paymentid is 16 or 64 hex chars
	lamountstr := strings.TrimSpace(amountstr)

	_, err := globals.ParseAmount(lamountstr)

	if err != nil {
		global_object.SetAmountverified(false)
		return
	}

	global_object.SetAmountverified(true)

}

// generate and update all integrated addresses
func (t *CtxObject) genintegratedaddress() {
	if global_object != nil && global_object.walletptr != nil {

		addr := global_object.walletptr.GetAddress()
		i32 := global_object.walletptr.GetRandomIAddress32()
		i8 := global_object.walletptr.GetRandomIAddress8()

		global_object.SetWallet_address(addr.String())

		global_object.SetIntegrated_32_address(i32.String())
		global_object.SetIntegrated_32_address_paymentid(fmt.Sprintf("%x", i32.PaymentID))

		global_object.SetIntegrated_8_address(i8.String())
		global_object.SetIntegrated_8_address_paymentid(fmt.Sprintf("%x", i8.PaymentID))
	}
}

*/

// generate and update all integrated addresses
func (t *CtxObject) reloadhistory(available, in, out bool, max_limit int64) ([]string, []string, []string) {

	var listheight []string
	var listtopoheight []string

	var listtxid []string
	var listamount []string
	var listpaymentid []string

	var liststatus []string
	var listunlocktime []string

	var listdetails []string

	if global_object != nil && global_object.walletptr != nil {

		min_height := uint64(0)
		max_height := uint64(0)
		pool := false
		transfers := global_object.walletptr.Show_Transfers(available, in, out, pool, false, false, min_height, max_height) // receives sorted

		if len(transfers) == 0 {
			return listtxid, listamount, listdetails
		}

		for i := range transfers {
			if i < int(max_limit) { // only return max results

				listheight = append(listheight, fmt.Sprintf("%d", transfers[i].Height))
				listtopoheight = append(listtopoheight, fmt.Sprintf("%d", transfers[i].TopoHeight))

				listtxid = append(listtxid, transfers[i].TXID.String())
				listamount = append(listamount, globals.FormatMoney12(transfers[i].Amount))
				listpaymentid = append(listpaymentid, fmt.Sprintf("%x ", transfers[i].PaymentID))

				liststatus = append(liststatus, fmt.Sprintf("%d", transfers[i].Status))
				listunlocktime = append(listunlocktime, fmt.Sprintf("%d", transfers[i].Unlock_Time))

				outdetails := false
				if transfers[i].Status == 1 { // if tx is outgoing, try to get object and serialize it if okay
					details := global_object.walletptr.GetTXOutDetails(transfers[i].TXID)
					if details.Fees != 0 { // if fees is not zero, we have good data, process it now
						details_string, err := json.Marshal(&details)
						if err == nil {
							listdetails = append(listdetails, string(details_string))
							outdetails = true

							// fmt.Printf("go full deteail %d %d\n", i,transfers[i].Height)
						}
					}
				}

				if !outdetails {
					listdetails = append(listdetails, " ") // empty strings have issues
					//  fmt.Printf("skipped deteail %d %d\n", i,transfers[i].Height)
				}

			}
		}
	}
	return listtxid, listamount, listdetails
}
/*
//  create wallet using recovery key
func (t *CtxObject) recoverusingkey(filename, password, seed_key_string string) {

	t.Lock()
	defer t.Unlock()
	//fmt.Printf("recoverusingkey file %s", filename)

	if global_object != nil && global_object.walletptr != nil {
		return
	}

	if runtime.GOOS == "windows" {
		filename = strings.TrimPrefix(filename, "/")
		filename = strings.TrimPrefix(filename, "\\")
	}
	var seedkey crypto.Key

	seed_raw, err := hex.DecodeString(seed_key_string) // hex decode
	if len(seed_key_string) != 64 || err != nil {      //sanity check
		global_object.SetIniterr("Key must be 64 chars hexadecimal chars")
		return
	}

	copy(seedkey[:], seed_raw[:32])

	walletptr, err := walletapi.Create_Encrypted_Wallet(filepath.Join(filename, "wallet.db"), password, seedkey)
	if err != nil {
		globals.Logger.Warnf("Error while recovering wallet using seed key err %s\n", err)
		global_object.SetIniterr(fmt.Sprintf("Error while recovering wallet using key err %s", err))
		return
	}

	// we are here means wallet opened successfully
	t.Common_Wallet_Setup(walletptr)
}

//  create wallet using recovery key
func (t *CtxObject) recoverusingseedwords(filename, password, seed_key_string string) {

	t.Lock()
	defer t.Unlock()
	// fmt.Printf("recoverusingkey file %s", filename)

	if global_object != nil && global_object.walletptr != nil {
		return
	}

	if runtime.GOOS == "windows" {
		filename = strings.TrimPrefix(filename, "/")
		filename = strings.TrimPrefix(filename, "\\")
	}

	walletptr, err := walletapi.Create_Encrypted_Wallet_From_Recovery_Words(filepath.Join(filename, "wallet.db"), password, seed_key_string)
	if err != nil {
		//globals.Logger.Warnf("Error while recovering wallet using seed words err %s\n", err)
		global_object.SetIniterr(fmt.Sprintf("Error while recovering wallet using seed words err %s", err))
		return
	}

	// we are here means wallet opened successfully
	t.Common_Wallet_Setup(walletptr)
}*/

//  create wallet using recovery key
func (t *CtxObject) openwallet(filename, password string)(string) {
	t.Lock()
	defer t.Unlock()

	if global_object != nil && global_object.walletptr != nil {
		return "already logged in"
	}

	if runtime.GOOS == "windows" {
		filename = strings.TrimPrefix(filename, "/")
		filename = strings.TrimPrefix(filename, "\\")
	}

	//fmt.Printf("openwallet file %s\n", filename)
	walletptr, err := walletapi.Open_Encrypted_Wallet(filename, password)
	if err != nil {
		//globals.Logger.Warnf("Error while recovering wallet using seed key err %s\n", err)
		//global_object.SetIniterr(fmt.Sprintf("Error occurred while opening wallet file %s. err %s", filename, err))
		return "Error opening wallet file"
	}

	// we are here means wallet opened successfully
	addr := t.Common_Wallet_Setup(walletptr)
	return addr
}

//  create new wallet
func (t *CtxObject) createnewwallet(filename, password string) {
	t.Lock()
	defer t.Unlock()

	if global_object != nil && global_object.walletptr != nil {
		return
	}

	if runtime.GOOS == "windows" {
		filename = strings.TrimPrefix(filename, "/")
		filename = strings.TrimPrefix(filename, "\\")
	}

	//fmt.Printf("createnewwallet file %s", filename)
	_, err := walletapi.Create_Encrypted_Wallet_Random(filepath.Join(filename, "wallet.db"), password)
	if err != nil {
		//globals.Logger.Warnf("Error while recovering wallet using seed key err %s\n", err)
		//global_object.SetIniterr(fmt.Sprintf("Error occured while creating new wallet file %s. err %s", filename, err))
		return 
	}

	// we are here means wallet opened successfully
	//t.Common_Wallet_Setup(walletptr)
}

func (t *CtxObject) Common_Wallet_Setup(walletptr *walletapi.Wallet) (string) {

	global_object.walletptr = walletptr

	addr := global_object.walletptr.GetAddress()
	fmt.Println(addr)
	return addr.String()
	//global_object.SetWallet_address(addr.String())

	//global_object.SetWallet_valid(true) // mark wallet as valid

}
/*
//  check whether users knows the current password or not
func (t *CtxObject) checkpassword(password string) {
	t.Lock()
	defer t.Unlock()

	if global_object == nil || global_object.walletptr == nil {
		global_object.SetIniterr(fmt.Sprintf("Wallet not yet opened"))
		return
	}

	if global_object.walletptr.Check_Password(password) {
		global_object.SetIniterr("")
	} else {
		global_object.SetIniterr(fmt.Sprintf("Invalid Password"))
	}

}

//  set new wallet, password
//  password must have been checked before
func (t *CtxObject) setpassword(oldpassword, password string) {
	t.Lock()
	defer t.Unlock()

	if global_object == nil || global_object.walletptr == nil {
		global_object.SetIniterr(fmt.Sprintf("Wallet not yet opened"))
		return
	}

	if global_object.walletptr.Check_Password(oldpassword) {
		global_object.SetIniterr("")
	} else {
		global_object.SetIniterr(fmt.Sprintf("Invalid Password"))
	}

	err := global_object.walletptr.Set_Encrypted_Wallet_Password(password)
	if err != nil {
		global_object.SetIniterr(fmt.Sprintf("Cannot set new password, err %s", err))
	}
}

*/
func (t *CtxObject) build_tx(destination, amount_str, paymentid string)(string) {
	t.Lock()
	defer t.Unlock()

	if global_object == nil || global_object.walletptr == nil {
		return ""
	}

	addr, err := globals.ParseValidateAddress(destination)
	if err != nil {
		fmt.Println(err)
		return destination
	}

	amount_to_transfer, err := globals.ParseAmount(amount_str)
	if err != nil {
		return "parse amount"
	}

	lpayid := strings.TrimSpace(paymentid)

	// if integrated address, payment id should be ignored
	if fmt.Sprintf("%x", addr.PaymentID) == strings.ToLower(lpayid) {
		lpayid = ""
	}

	lpayid_raw, err := hex.DecodeString(lpayid)

	if err != nil {
		return "decode payid"
	}

	switch len(lpayid_raw) {
	case 0, 8, 32:
	default:
		return "lpayidraw"
	}

	addr_list := []address.Address{*addr}
	amount_list := []uint64{amount_to_transfer} // transfer 50 dero, 2 dero
	fees_per_kb := uint64(0)                    // fees  must be calculated by walletapi

	tx, inputs, _, _, err := global_object.walletptr.Transfer(addr_list, amount_list, 0, lpayid, fees_per_kb, 0)
	_ = inputs
	if err != nil {
		return "transfer"

	}

	// now setup properties for qt to display some info and confirm
	tx_hex := hex.EncodeToString(tx.Serialize())
	/*global_object.SetTxid_hex(tx.GetHash().String())
	global_object.SetTx_total(globals.FormatMoney12(input_sum))
	global_object.SetTx_transfer_amount(globals.FormatMoney12(amount_to_transfer))
	global_object.SetTx_change(globals.FormatMoney12(change))
	global_object.SetTx_fees(globals.FormatMoney12(tx.RctSignature.Get_TX_Fee()))*/
	return tx_hex
}

//  create new wallet
func (t *CtxObject) relay_tx(tx_hex string) {
	t.Lock()
	defer t.Unlock()

	if global_object == nil || global_object.walletptr == nil {
		return
	}

	 // this does NOT work, we must clean up the property from QML side, everywhere

	tx_raw, err := hex.DecodeString(tx_hex)

	if err != nil {
		return
	}

	// deserialize tx
	var tx transaction.Transaction

	err = tx.DeserializeHeader(tx_raw)

	if err != nil {
		return
	}

	err = global_object.walletptr.SendTransaction(&tx)

	if err != nil {
		return
	}

	// global_object.SetIniterr("TODO TX relaying not supported")
}


//  set wallet online
func (t *CtxObject) setwalletonline(wallet_server_address string) {
	t.Lock()
	defer t.Unlock()
	if global_object != nil && global_object.walletptr != nil {
		global_object.walletptr.SetDaemonAddress(wallet_server_address) // set remote mode
		global_object.walletptr.SetOnlineMode()
		fmt.Println("Asadasdasd")
	}
}
/*
//  set wallet online
func (t *CtxObject) setwalletoffline() {
	t.Lock()
	defer t.Unlock()

	if global_object != nil && global_object.walletptr != nil {

		global_object.walletptr.SetOfflineMode()

	}
}

//  create new wallet
func (t *CtxObject) seed_language(lang string) {
	t.Lock()
	defer t.Unlock()

	if global_object != nil && global_object.walletptr != nil {
		global_object.SetSeed(global_object.walletptr.GetSeedinLanguage(lang))

		return
	}

}

//  create new wallet
func (t *CtxObject) closewallet() {
	t.Lock()
	defer t.Unlock()

	if global_object != nil && global_object.walletptr != nil {
		tmp := global_object.walletptr

		global_object.SetWallet_valid(false)
		global_object.SetWallet_address("")
		global_object.walletptr = nil

		global_object.SetIntegrated_32_address(" ")
		global_object.SetIntegrated_32_address_paymentid(" ")

		global_object.SetIntegrated_8_address(" ")
		global_object.SetIntegrated_8_address_paymentid(" ")

		tmp.Close_Encrypted_Wallet()
	}

}*/