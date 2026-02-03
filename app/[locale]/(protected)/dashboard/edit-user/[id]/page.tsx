"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import Loader from "@/components/loader";
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@/components/ui/select";
import {UserRole, UserRoleLabel} from "@/enum";
import useGettingUserById from "@/services/users/gettingUserById";
import useDeactivateUser from "@/services/users/DeactivateUsers";
import {Loader2} from "lucide-react";
import useGettingBalanceForUser from "@/services/balance/gettingBalanceForUser";
import useDepositCash from "@/services/balance/deposit-cash";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import {Controller} from "react-hook-form";
import useUpdateUser from "@/services/users/updateUser";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

const EditUser = () => {
    const t = useTranslations("EditUser");

  // Params
  const params = useParams();
  const id = params?.id;
  const isAdmin = Cookies.get("userRole") == "Admin";

  // getting user Data by id
  const {error, loading, user, getUserById} = useGettingUserById()

    // getting all regions
    const {loading: regionsLoading, error: regionsError, getAllMainAreas, mainAreas} = useGettingAllMainAreas()

  // getting balance for users
  const {loading: balanceLoading, error: balanceError, balances, getBalanceForUser} = useGettingBalanceForUser()

  // Deactivate user
  const { deactivateUser, loading: deactivateUserLoading, error: deactivateUserError } = useDeactivateUser()

  // handling deposit cash
  const {depositCash, loading: depositCashLoading} = useDepositCash()

    const {loading: updateUserLoading, updateUser} = useUpdateUser()

  // Router navigator
  const router = useRouter();

  // state for activation user
  const [activate, setActivate] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [minOrder, setMinOrder] = useState(0);
  const [region, setRegion] = useState("");

  // for debosit
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    // Handle update (you'd normally call an update API here)
    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append("UserName", userName);
        formData.append("Email", email);
        formData.append("PhoneNumber", phoneNumber);
        formData.append("BussinesName", businessName);
        formData.append("MinOrder", minOrder.toString());
        formData.append("RegionId", region);
        formData.append("RegionName", mainAreas?.find((area) => area.id === region)?.regionName || "");
        formData.append("IsActive", activate.toString());
        formData.append("PharmacyDetails", 'null');
        formData.append("DesName", 'null');

        try {
            const {success, error} =  await updateUser(formData, id);
            if (success) {
                toast.success(t("updateUser"), { description: t("userUpdated") });
                await getUserById(id)
            } else if (error) {
                throw new Error(error)
            }
        } catch (err) {
            toast.error(t("updateFailed"));
        }
    };

    const activateUserToggle = async () => {

        try {
            const {success, error} =  await deactivateUser(id);
            if (success) {
                toast.success(t("updateUser"), { description: t("userUpdated") });
                await getUserById(id)
            } else if (error) {
                throw new Error(error)
            }
        } catch (err) {
            toast.error(t("updateFailed"));
        }
    };

  // Handle deposit cash
    const handleDepositCash = async () => {
        try {
            const {success, error} =  await depositCash({amount, description}, id);
            if (success) {
                toast.success(t("depositCash"), { description: t("depositAmountSuccess") });
                setDescription("")
                setAmount("");
                getBalanceForUser(id); // Refresh balance after deposit
            } else if (error) {
                throw new Error(error)
            }
        } catch (err) {
            toast.error(t("depositAmountError"));
        }
    };

  useEffect(() => {
    if (user && mainAreas) {
      setUserRole(user?.roleId as UserRole);
      setActivate(user?.isActive);
      setUserName(user?.userName);
      setEmail(user?.email);
      setPhoneNumber(user?.phoneNumber);
      setBusinessName(user?.businessName);
      setMinOrder(user?.minOrder);
      setRegion(user?.regionId || "");
    }
  }, [user, mainAreas]);

  useEffect(() => {
    getUserById(id);
    getAllMainAreas();
    if (isAdmin) {
        getBalanceForUser(id);
    }
  }, []);


  return (
      <div className="gap-4 rounded-lg">
        {loading || regionsLoading ? (
            <div className="flex mx-auto justify-center items-center">
              <Loader2 className="animate-spin" />
            </div>
        ) : (
          <>
              <div className="col-span-12 space-y-6">
                  <Card>
                      <CardHeader className="border-b border-solid border-default-200 mb-6">
                          <CardTitle>{t("userInformation")}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="userName">{t("userName")}</Label>
                              <Input
                                  id="userName"
                                  className="flex-1"
                                  value={userName}
                                  onChange={(e) => setUserName(e.target.value)}
                              />
                          </div>

                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="email">{t("email")}</Label>
                              <Input
                                  id="email"
                                  className="flex-1"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                              />
                          </div>

                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="phone">{t("phoneNumber")}</Label>
                              <Input
                                  id="phone"
                                  className="flex-1"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                          </div>

                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="business">{t("businessName")}</Label>
                              <Input
                                  id="business"
                                  className="flex-1"
                                  value={businessName}
                                  onChange={(e) => setBusinessName(e.target.value)}
                              />
                          </div>

                          <div className="space-y-2 flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="region">{t("Region")}</Label>
                              <Select value={region} onValueChange={(value) => setRegion(value)}>
                                  <SelectTrigger className="flex-1 cursor-pointer">
                                      <SelectValue placeholder="Select region" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {mainAreas?.map((region) => (
                                          <SelectItem key={region.id} value={region.id as string
                                          }>
                                              {region.regionName}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </div>

                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="minOrder">{t("minOrderAmount")}</Label>
                              <Input
                                  id="minOrder"
                                  type="number"
                                  className="flex-1"
                                  value={minOrder}
                                  onChange={(e) => setMinOrder(Number(e.target.value))}
                              />
                          </div>

                          <div className="col-span-12 flex justify-end mt-4">
                              <Button onClick={handleUpdate}>
                                  {updateUserLoading ? (
                                      <div className="flex flex-row gap-3 items-center">
                                          <Loader />
                                          <div className="flex justify-center items-center">
                                              <Loader2 className="text-white animate-spin"/>
                                          </div>
                                      </div>
                                  ) : (
                                      t("updateUser")
                                  )}
                              </Button>
                          </div>
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader className="border-b border-solid border-default-200 mb-6">
                          <CardTitle> {t("ProfileActivation")} </CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-center flex-wrap">
                              <Label className="w-[150px] flex-none" htmlFor="active">{t("active")}</Label>
                              <Select value={activate ? "true" : "false"} onValueChange={(value) => setActivate(value === "true")}>
                                  <SelectTrigger className="flex-1 cursor-pointer">
                                      <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="true">{t("activate")}</SelectItem>
                                      <SelectItem value="false">{t("deactivate")}</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="col-span-12 flex justify-end mt-4">
                              <Button onClick={activateUserToggle}>
                                  {deactivateUserLoading ? (
                                      <div className="flex flex-row gap-3 items-center">
                                          <Loader />
                                          <div className="flex justify-center items-center">
                                              <Loader2 className="text-white animate-spin"/>
                                          </div>
                                      </div>
                                  ) : (
                                    t("changeUserActivation")
                                  )}
                              </Button>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          </>
        )}

        {balanceLoading ? (
            <div className="flex mx-auto justify-center items-center">
              <Loader2 className="animate-spin" />
            </div>
        ) : (
            <>
                {isAdmin && (
                    <Card>
                        <CardHeader className="border-b border-solid border-default-200 mb-6 mt-4">
                            <CardTitle>{t("BalanceInformation")}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <table className="min-w-full border border-gray-300 text-sm text-left">
                              {balances && balances.length > 0 ? (
                                  <table className="min-w-full border border-gray-300 text-sm text-left">
                                    <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 border">{t("AccountType")}</th>
                                      <th className="px-4 py-2 border">{t("Balance")}</th>
                                      <th className="px-4 py-2 border">{t("CreditLimit")}</th>
                                      <th className="px-4 py-2 border">{t("CreatedAt")}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {balances.map((balance) => (
                                        <tr key={balance.id}>
                                          <td className="px-4 py-2 border">
                                            {balance.accountType === '0' ? t('Cash') : t('Credit')}
                                          </td>
                                          <td className="px-4 py-2 border">{balance.balance.toFixed(2)}</td>
                                          <td className="px-4 py-2 border">{balance.creditLimit.toFixed(2)}</td>
                                          <td className="px-4 py-2 border">
                                            {new Date(balance.createdAt).toLocaleString()}
                                          </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                  </table>
                              ) : (
                                  <p>{t("noBalanceFound")}</p>
                              )}
                            </table>
                        </CardContent>
                    </Card>
                )}
            </>
        )}

          {isAdmin && (
            <Card>
                <CardHeader className="border-b border-solid border-default-200 mb-6 mt-4">
                    <CardTitle>{t("depositCash")}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center flex-wrap">
                        <Label className="w-[150px] flex-none" htmlFor="amount">{t("amount")}</Label>
                        <Input
                            id="amount"
                            type="number"
                            className="flex-1"
                            onChange={(e) => setAmount(e.target.value)}
                            value={amount}
                            placeholder={t("depositAmountPlaceholder")}
                        />
                    </div>

                    <div className="flex items-center flex-wrap">
                        <Label className="w-[150px] flex-none" htmlFor="description">{t("Description")}</Label>
                        <Textarea
                            id="description"
                            className="flex-1"
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                        />
                    </div>

                    <div  className={"flex items-center justify-end"}>
                        <Button onClick={() => {
                            handleDepositCash();
                        }}>
                            {depositCashLoading ? (
                                <Loader2 color="white" className={"animate-spin"} />
                            ) : (
                                t("depositCash")
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
          )}

      </div>
  );
};

export default EditUser;